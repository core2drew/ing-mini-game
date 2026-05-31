/* eslint-disable */
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { CloudTasksClient } from '@google-cloud/tasks';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/options';
import { PlayerStatus, UpdateStatusPayload } from './models/player.model';
import { google } from '@google-cloud/tasks/build/protos';
import { ScheduleRoomTimeoutPayload } from './models/schedule-room-timeout.model';
import { QuizSessionStatus } from './models/room.model';

initializeApp();
setGlobalOptions({ region: 'asia-east2' });

const tasksClient = new CloudTasksClient();
const QUIZ_TIMER_DURATION = 20;

export const onPlayerTimeoutWorker = onRequest(async (req, res) => {
  const { roomId, questionId } = req.body;

  if (!roomId || !questionId) {
    res.status(400).send('Missing roomId or questionId in task body.');
    return;
  }

  const firestore = getFirestore();
  const roomRef = firestore.collection('rooms').doc(roomId);
  const questionRef = roomRef.collection('questions').doc(questionId);
  const playersCollectionRef = roomRef.collection('players');

  try {
    // 1. Fetch Room and Question details in parallel to get the correct answer key
    const [roomDoc, questionDoc] = await Promise.all([roomRef.get(), questionRef.get()]);

    if (!roomDoc.exists) {
      res.status(200).send('Room no longer exists.');
      return;
    }

    if (!questionDoc.exists) {
      res.status(200).send(`Question ${questionId} not found. Cannot evaluate answers.`);
      return;
    }

    const questionData = questionDoc.data();
    const correctAnswer = questionData?.correctIndex;

    // 2. Fetch all players in the room
    const playersSnapshot = await playersCollectionRef.get();
    if (playersSnapshot.empty) {
      res.status(200).send('No players found in this room.');
      return;
    }

    const batch = firestore.batch();
    let updatedCount = 0;

    // 3. Loop through all players and decide status based on the answer key
    playersSnapshot.forEach((doc) => {
      const playerData = doc.data();
      const playerRef = doc.ref;
      const { chosenAnswer } = playerData;

      console.log('playerRef', playerRef);
      // CASE A: Player completely missed the question (No answer object exists)
      if (!chosenAnswer) {
        batch.update(playerRef, {
          status: PlayerStatus.WRONG,
          chosenAnswer: null,
        });
        updatedCount++;
        return;
      }

      // CASE B: Answer exists, but status is hanging/unprocessed or left as 'ANSWERED'
      // We process the evaluation on the server as a safety backup
      if (
        playerData.status === PlayerStatus.ANSWERED ||
        playerData.status === PlayerStatus.CORRECT ||
        playerData.status === PlayerStatus.WAITING
      ) {
        const isCorrect = chosenAnswer === correctAnswer;

        const updatePayload: Record<string, any> = {};

        // Award points if they were correct but the frontend process got cut off
        if (isCorrect) {
          updatePayload.status = PlayerStatus.CORRECT;
          updatePayload.score = playerData.score + questionData?.points; // Adjust score increment logic as needed
        } else {
          updatePayload.status = PlayerStatus.WRONG;
        }
        updatePayload.chosenAnswer = null;
        batch.update(playerRef, updatePayload);
        updatedCount++;
      }
    });

    // 4. Commit all evaluations atomically
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`Evaluated and updated ${updatedCount} players for question ${questionId}.`);
    } else {
      console.log(`All players already safely processed for question ${questionId}.`);
    }

    res
      .status(200)
      .send(`Successfully processed room timeout evaluation for ${updatedCount} players.`);
  } catch (error) {
    console.error('Error executing master answer evaluation loop:', error);
    res.status(500).send('Internal server error during answer verification loop.');
  }
});

/**
 * Helper to queue up the next Cloud Task
 */
export async function scheduleRoomTimeout(payload: ScheduleRoomTimeoutPayload) {
  const { roomId, questionId, scheduleTime } = payload;

  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const location = 'asia-east2';
  const queueName = 'quiz-timeout-queue';

  const queuePath = tasksClient.queuePath(projectId!, location, queueName);
  const url = `https://${location}-${projectId}.cloudfunctions.net/onPlayerTimeoutWorker`;

  // Only pass room and question details now
  const workerPayload = { roomId, questionId };

  const task: google.cloud.tasks.v2.ITask = {
    httpRequest: {
      httpMethod: 'POST',
      url: url,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.from(JSON.stringify(workerPayload)).toString('base64'),
    },
    scheduleTime: { seconds: Math.floor(scheduleTime.getTime() / 1000) },
  };

  try {
    const [response] = await tasksClient.createTask({ parent: queuePath, task });
    console.log(`Room timeout task created for room ${roomId}: ${response.name}`);
    return response.name;
  } catch (error) {
    console.error('Failed to create room task:', error);
    throw error;
  }
}

function getFirestoreTimeoutTimestamp(durationInSeconds: number): Timestamp {
  // 1. Create the JS Date object using millisecond math
  const futureDate = new Date(Date.now() + durationInSeconds * 1000);

  // 2. Convert that Date safely into a Firestore Timestamp
  return Timestamp.fromDate(futureDate);
}

// Re-use the scheduling helper we wrote earlier
export const startQuiz = onCall(async (request) => {
  const { roomId } = request.data;
  const firestore = getFirestore();
  const roomRef = firestore.collection('rooms').doc(roomId);
  const playersRef = roomRef.collection('players'); // As

  // 1. Fetch all players currently in the room
  const playersSnapshot = await playersRef.get();

  // 2. Initialize a Firestore Write Batch
  const batch = firestore.batch();

  // 3. Queue up the Room updates
  const questionTimerExpiresAt = getFirestoreTimeoutTimestamp(QUIZ_TIMER_DURATION);

  // 4. Queue up status updates for every player found in the room
  playersSnapshot.forEach((playerDoc) => {
    batch.update(playerDoc.ref, { status: PlayerStatus.THINKING });
  });

  batch.update(roomRef, {
    'quizSession.status': QuizSessionStatus.STARTED,
    'quizSession.currentQuestionIndex': 0,
    'quizSession.questionTimerExpiresAt': questionTimerExpiresAt,
  });

  // 5. Commit the batch atomically
  await batch.commit();

  // Kick off the automated background loop for index 0
  await scheduleRoomTimeout({
    roomId,
    questionId: '0',
    scheduleTime: questionTimerExpiresAt.toDate(),
  });

  return { success: true };
});

export const restartQuiz = onCall(async (request) => {
  const { roomId } = request.data;
  const firestore = getFirestore();
  const roomRef = firestore.collection('rooms').doc(roomId);
  const playersRef = roomRef.collection('players');

  // 1. Fetch all players currently in the room
  const playersSnapshot = await playersRef.get();

  // Initialize a WriteBatch for high-speed concurrent updates
  const batch = firestore.batch();

  playersSnapshot.forEach((doc) => {
    batch.update(doc.ref, { score: 0, status: PlayerStatus.WAITING });
  });

  batch.update(roomRef, {
    'quizSession.currentQuestionIndex': 0,
    'quizSession.questionTimerExpiresAt': null,
    'quizSession.status': QuizSessionStatus.WAITING,
  });

  // Commit all changes simultaneously
  await batch.commit();

  return { success: true };
});

export const endQuiz = onCall(async (request) => {
  const { roomId } = request.data;
  const firestore = getFirestore();
  const roomRef = firestore.collection('rooms').doc(roomId);

  await roomRef.update({
    'quizSession.currentQuestionIndex': 0,
    'quizSession.questionTimerExpiresAt': null,
    'quizSession.status': QuizSessionStatus.ENDED,
  });

  return { success: true };
});

export const purgePlayers = onCall(async (request) => {
  const { roomId } = request.data;
  const firestore = getFirestore();
  const roomRef = firestore.collection('rooms').doc(roomId);
  const playerRef = roomRef.collection('players');
  // Delete all player collection
  await firestore.recursiveDelete(playerRef);
});

export const nextQuestion = onCall(async (request) => {
  try {
    const { roomId } = request.data;
    const firestore = getFirestore();

    const roomRef = firestore.collection('rooms').doc(roomId);
    const playersRef = roomRef.collection('players');

    const playersSnapshot = await playersRef.get();

    // 1. Fetch data OUTSIDE the batch (Batches cannot perform reads)
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      throw new HttpsError('not-found', 'Room not found');
    }

    const roomData = roomDoc.data()!;
    const session = roomData.quizSession || {};

    // Calculate index based on the static snapshot we just read
    const nextQuestionIndex =
      session.currentQuestionIndex !== undefined ? session.currentQuestionIndex + 1 : 0;

    const nextQuestionDocId = nextQuestionIndex.toString();

    const questionRef = roomRef.collection('questions').doc(nextQuestionDocId);
    const questionDoc = await questionRef.get();

    if (session.status !== QuizSessionStatus.STARTED) {
      return {
        success: true,
        message: `Can't proceed the quiz session is not started yet.`,
      };
    }

    if (questionDoc.exists) {
      console.log(`Question index ${nextQuestionDocId} data:`, questionDoc.data());
      // 2. Initialize the write batch
      const batch = firestore.batch();

      playersSnapshot.forEach((playerDoc) => {
        const playerData = playerDoc.data();
        if (playerData.status === PlayerStatus.CORRECT) {
          batch.update(playerDoc.ref, {
            status: PlayerStatus.THINKING,
            chosenAnswer: null,
          });
        }
      });

      const nextExpiryDate = getFirestoreTimeoutTimestamp(QUIZ_TIMER_DURATION);

      // Stage the update in the batch
      batch.update(roomRef, {
        'quizSession.currentQuestionIndex': nextQuestionIndex,
        'quizSession.questionTimerExpiresAt': nextExpiryDate,
      });

      // 3. Commit the batch writes atomically
      await batch.commit();

      // Side effects like scheduling can happen after successful commit
      await scheduleRoomTimeout({
        roomId,
        questionId: nextQuestionDocId,
        scheduleTime: nextExpiryDate.toDate(),
      });

      return {
        success: true,
        roomId,
        nextExpiryDate,
      };
    }

    // If no more questions, we commit nothing and just return
    return {
      success: true,
      message: 'No more questions available',
    };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Error advancing to next question:', error);
    throw new HttpsError('internal', 'Error advancing to next question');
  }
});

export const purgeIdlePlayers = onCall(async (request) => {
  try {
    const { roomId } = request.data;
    if (!roomId) {
      throw new HttpsError('invalid-argument', 'Room ID is required.');
    }

    const firestore = getFirestore();
    const roomRef = firestore.collection('rooms').doc(roomId);
    const playersRef = roomRef.collection('players');

    const roomDoc = await roomRef.get();
    const roomData = roomDoc.data()!;

    if (roomData['quizSession']['status'] !== QuizSessionStatus.STARTED) {
      return {
        success: true,
        message: `Can't proceed the quiz session is not started yet.`,
      };
    }

    // Fetch players who didn't submit an answer in time (Status = 2)
    const snapshot = await playersRef
      .where('status', 'in', [
        PlayerStatus.THINKING,
        PlayerStatus.WRONG,
        PlayerStatus.WAITING,
        PlayerStatus.ANSWERED,
      ])
      .get();

    if (snapshot.empty) {
      return { success: true, message: 'No idle players found.' };
    }

    // Initialize a WriteBatch for high-speed concurrent updates
    const batch = firestore.batch();

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { status: PlayerStatus.OFFLINE });
    });

    // Commit all changes simultaneously
    await batch.commit();

    return {
      success: true,
      disconnectedCount: snapshot.size,
    };
  } catch (error) {
    console.error('Error disconnecting idle players:', error);
    throw new HttpsError('internal', 'Failed to update player statuses.');
  }
});

export const transitionWaitingToThinking = onCall(async (request) => {
  try {
    const { roomId } = request.data;
    if (!roomId) {
      throw new HttpsError('invalid-argument', 'Room ID is required.');
    }

    const firestore = getFirestore();
    const roomRef = firestore.collection('rooms').doc(roomId);
    const playersRef = roomRef.collection('players');

    const roomDoc = await roomRef.get();
    const roomData = roomDoc.data()!;

    if (roomData['quizSession.status'] !== QuizSessionStatus.STARTED) {
      return {
        success: true,
        message: `Can't proceed the quiz session is not started yet.`,
      };
    }

    // Fetch all players who are currently waiting (Status = WAITING)
    const snapshot = await playersRef.where('status', '==', PlayerStatus.WAITING).get();

    if (snapshot.empty) {
      return { success: true, message: 'No waiting players found.' };
    }

    // Initialize a WriteBatch for high-speed concurrent updates
    const batch = firestore.batch();

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { status: PlayerStatus.THINKING });
    });

    // Commit all state updates atomically in a single network request
    await batch.commit();

    return {
      success: true,
      activatedCount: snapshot.size,
    };
  } catch (error) {
    console.error('Error transitioning waiting players:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to update player statuses.');
  }
});

export const submitAnswer = onCall(async (request) => {
  const { roomId, playerName, chosenAnswer } = request.data as UpdateStatusPayload;

  // 1. Defend the Gate: Validate incoming input types
  if (!roomId || !playerName || chosenAnswer === undefined) {
    throw new HttpsError('invalid-argument', 'Missing required parameters.');
  }

  const cleanName = playerName.trim().toLowerCase();
  const firestore = getFirestore();
  const roomRef = firestore.collection('rooms').doc(roomId);
  const playerRef = roomRef.collection('players').doc(cleanName);

  try {
    // 3. Document Verification (Reads are done outside of batches)
    const [roomDoc, playerDoc] = await Promise.all([roomRef.get(), playerRef.get()]);

    if (!roomDoc.exists) {
      throw new HttpsError('not-found', 'Room not found.');
    }

    if (!playerDoc.exists) {
      throw new HttpsError('not-found', 'Player not found.');
    }

    // 4. Initialize and execute the Batch
    const batch = firestore.batch();

    const updatePayload: Record<string, any> = {
      status: PlayerStatus.ANSWERED,
      lastScoreUpdateTime: Timestamp.now(),
      chosenAnswer,
    };

    batch.update(playerRef, updatePayload);

    // Commit all operations atomically
    await batch.commit();

    return { success: true };
  } catch (error: any) {
    if (error instanceof HttpsError) throw error;
    console.error('Error updating player status:', error);
    throw new HttpsError('internal', error.message || 'Batch update failed.');
  }
});
