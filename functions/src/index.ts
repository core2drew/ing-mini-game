/* eslint-disable */
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { CloudTasksClient } from '@google-cloud/tasks';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/options';
import { PlayerStatus, UpdateStatusPayload } from './models/player.model';
import { google } from '@google-cloud/tasks/build/protos';
import { ScheduleRoomTimeoutPayload } from './models/schedule-room-timeout.model';

initializeApp();
setGlobalOptions({ region: 'asia-east2' });

const tasksClient = new CloudTasksClient();

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
  const durationInSeconds = 5;
  const questionTimerExpiresAt = getFirestoreTimeoutTimestamp(durationInSeconds);

  batch.update(roomRef, {
    isEnded: false,
    isStarted: true,
    'quizSession.currentQuestionIndex': 0,
    'quizSession.questionTimerExpiresAt': questionTimerExpiresAt,
  });

  // 4. Queue up status updates for every player found in the room
  playersSnapshot.forEach((playerDoc) => {
    batch.update(playerDoc.ref, { status: PlayerStatus.THINKING });
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
  const playerRef = roomRef.collection('players');

  await roomRef.update({
    isEnded: false,
    isStarted: false,
    'quizSession.currentQuestionIndex': 0,
    'quizSession.questionTimerExpiresAt': null,
    'quizSession.isEnded': false,
  });

  // Delete all player collection
  await firestore.recursiveDelete(playerRef);

  return { success: true };
});

export const endQuiz = onCall(async (request) => {
  const { roomId } = request.data;
  const firestore = getFirestore();
  const roomRef = firestore.collection('rooms').doc(roomId);

  await roomRef.update({
    isEnded: true,
    isStarted: false,
    'quizSession.isEnded': true,
  });

  return { success: true };
});

export const nextQuestion = onCall(async (request) => {
  try {
    const { roomId } = request.data;
    const firestore = getFirestore();
    const roomRef = firestore.collection('rooms').doc(roomId);

    // Use a transaction to prevent race conditions
    await firestore.runTransaction(async (transaction) => {
      const roomDoc = await transaction.get(roomRef);

      if (!roomDoc.exists) {
        throw new Error('Room not found');
      }

      const roomData = roomDoc.data()!;

      const session = roomData.quizSession || {};

      // If currentQuestionIndex is null/undefined, start at 0. Otherwise increment.
      const currentQuestionIndex =
        session.currentQuestionIndex !== undefined ? session.currentQuestionIndex + 1 : 0;

      const questionRef = roomRef.collection('questions').doc(currentQuestionIndex.toString());
      const questionDoc = await transaction.get(questionRef);

      // Fetch the next question ID from your quiz definition
      if (questionDoc.exists) {
        console.log(`Question index ${currentQuestionIndex} data:`, questionDoc.data());
        const durationInSeconds = 5;
        const nextExpiryDate = getFirestoreTimeoutTimestamp(durationInSeconds);

        transaction.update(roomRef, {
          'quizSession.currentQuestionIndex': currentQuestionIndex,
          'quizSession.questionTimerExpiresAt': nextExpiryDate,
        });

        await scheduleRoomTimeout({
          roomId,
          questionId: currentQuestionIndex,
          scheduleTime: nextExpiryDate.toDate(),
        });

        return {
          roomId,
          nextExpiryDate,
        };
      }

      return {
        message: 'No more questions available',
      };
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error; // Re-throw known HttpsErrors
    }
    throw new HttpsError('internal', 'Error advancing to next question');
  }
});

export const disconnectThinkingPlayers = onCall(async (request) => {
  try {
    const { roomId } = request.data;
    if (!roomId) {
      throw new HttpsError('invalid-argument', 'Room ID is required.');
    }

    const firestore = getFirestore();
    const playersRef = firestore.collection('rooms').doc(roomId).collection('players');

    // Fetch players who didn't submit an answer in time (Status = 2)
    const snapshot = await playersRef.where('status', '==', PlayerStatus.THINKING).get();

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
    const playersRef = firestore.collection('rooms').doc(roomId).collection('players');

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

export const updatePlayerStatus = onCall(async (request) => {
  const { roomId, playerName, targetStatus } = request.data as UpdateStatusPayload;

  // 1. Defend the Gate: Validate incoming input types
  if (!roomId || !playerName || targetStatus === undefined) {
    throw new HttpsError('invalid-argument', 'Missing required parameters.');
  }

  // 2. Prevent malicious inputs (Ensure the passed status actually exists in your enum)
  if (!Object.values(PlayerStatus).includes(targetStatus)) {
    throw new HttpsError('invalid-argument', 'Invalid player status provided.');
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
      status: targetStatus,
    };

    // Automatically log timestamps if the status shifts to ANSWERED
    if (targetStatus === PlayerStatus.ANSWERED) {
      updatePayload.lastScoreUpdateTime = Timestamp.now();
    }

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

export const updatePlayerScore = onCall(async (request) => {
  try {
    const { roomId, playerName } = request.data;

    // 1. Defend the Gate: Validate incoming input types
    if (!roomId || !playerName) {
      throw new HttpsError('invalid-argument', 'Missing required parameters.');
    }

    const firestore = getFirestore();
    const roomRef = firestore.collection('rooms').doc(roomId);
    const cleanName = playerName.trim().toLowerCase();
    const playerRef = roomRef.collection('players').doc(cleanName);

    // Use a transaction to prevent race conditions
    await firestore.runTransaction(async (transaction) => {
      // Execute reads concurrently to optimize transaction speed
      const [roomDoc, playerDoc] = await Promise.all([
        transaction.get(roomRef),
        transaction.get(playerRef),
      ]);

      if (!roomDoc.exists) {
        throw new HttpsError('not-found', 'Room not found.');
      }

      if (!playerDoc.exists) {
        throw new HttpsError('not-found', 'Player not found.');
      }

      const roomData = roomDoc.data()!;
      const session = roomData.quizSession || {};

      const currentQuestionIndex =
        session.currentQuestionIndex !== undefined ? session.currentQuestionIndex : 0;

      const questionRef = roomRef.collection('questions').doc(currentQuestionIndex.toString());
      const questionDoc = await transaction.get(questionRef);

      if (!questionDoc.exists) {
        throw new Error('Question not found');
      }

      const playerData = playerDoc.data();
      const questionData = questionDoc.data();

      const currentScore = playerData?.score;
      const currentQuestionScore = questionData?.score;

      transaction.update(playerRef, {
        score: currentScore + currentQuestionScore,
      });
    });
    return { success: true };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error; // Re-throw known HttpsErrors
    }
    throw new HttpsError('internal', 'Error updating player scrore');
  }
});

export const submitAnswer = onCall(async (request) => {
  const { roomId, playerName, chosenAnswer } = request.data as UpdateStatusPayload;

  // 1. Defend the Gate: Validate incoming input types
  if (!roomId || !playerName || chosenAnswer === undefined) {
    throw new HttpsError('invalid-argument', 'Missing required parameters.');
  }

  // 2. Prevent malicious inputs (Ensure the passed status actually exists in your enum)
  if (!Object.values(PlayerStatus).includes(chosenAnswer)) {
    throw new HttpsError('invalid-argument', 'Invalid player status provided.');
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
