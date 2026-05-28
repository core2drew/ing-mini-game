/* eslint-disable */
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { CloudTasksClient } from '@google-cloud/tasks';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/options';
import { PlayerStatus, UpdateStatusPayload } from './models/player.model';

initializeApp();
setGlobalOptions({ region: 'asia-east2' });

const firestore = getFirestore();
const tasksClient = new CloudTasksClient();

export const advanceQuestion = onRequest(async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      res.status(400).send('Missing roomId');
      return;
    }

    const roomRef = firestore.collection('rooms').doc(roomId);

    // Use a transaction to prevent race conditions
    const nextTaskData = await firestore.runTransaction(async (transaction) => {
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
        const durationInSeconds = 10;
        const nextExpiryDate = new Date(Date.now() + durationInSeconds * 1000);

        transaction.update(roomRef, {
          'quizSession.currentQuestionIndex': currentQuestionIndex,
          'quizSession.questionTimerExpiresAt': Timestamp.fromDate(nextExpiryDate),
        });

        return {
          roomId,
          nextExpiryDate,
        };
      }

      // No more questions left, end the quiz
      console.log(`No question found at index ${currentQuestionIndex}. Ending quiz.`);
      transaction.update(roomRef, {
        isEnded: true,
        isStarted: false,
      });
      return null;
    });

    if (nextTaskData) {
      await scheduleNextQuestionTask(nextTaskData.roomId, nextTaskData.nextExpiryDate);
    }

    res.status(200).send({ success: true });
  } catch (error: any) {
    console.error('Error advancing question:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Helper to queue up the next Cloud Task
 */
async function scheduleNextQuestionTask(roomId: string, scheduleTime: Date) {
  const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
  const location = 'asia-east2';
  const queue = 'quiz-timer-queue'; // Must be created in Google Cloud Console
  const serviceAccountEmail = '718485456752-compute@developer.gserviceaccount.com';
  if (!projectId) {
    throw new Error('Missing GCLOUD_PROJECT environment variable');
  }

  const queuePath = tasksClient.queuePath(projectId, location, queue);
  const url = process.env.ADVANCE_QUESTION_URL;
  if (!url) {
    throw new Error('Missing ADVANCE_QUESTION_URL environment variable');
  }

  const task = {
    httpRequest: {
      httpMethod: 'POST' as const,
      url,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.from(JSON.stringify({ roomId })).toString('base64'),
      oidcToken: {
        serviceAccountEmail,
      },
    },
    scheduleTime: {
      seconds: Math.floor(scheduleTime.getTime() / 1000),
    },
  };

  await tasksClient.createTask({ parent: queuePath, task });
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
  const durationInSeconds = 20;

  await roomRef.update({
    isEnded: false,
    isStarted: true,
    'quizSession.currentQuestionIndex': 0,
    'quizSession.questionTimerExpiresAt': getFirestoreTimeoutTimestamp(durationInSeconds),
  });

  // Kick off the automated background loop for index 0
  // await scheduleNextQuestionTask(roomId, firstExpiry);

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
    'quizSession.currentQuestionIndex': 0,
    'quizSession.questionTimerExpiresAt': null,
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
        const durationInSeconds = 20;
        const nextExpiryDate = getFirestoreTimeoutTimestamp(durationInSeconds);

        transaction.update(roomRef, {
          'quizSession.currentQuestionIndex': currentQuestionIndex,
          'quizSession.questionTimerExpiresAt': nextExpiryDate,
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

  const roomRef = firestore.collection('rooms').doc(roomId);
  const playerRef = roomRef.collection('players').doc(playerName);

  try {
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

      // Write the clean, dynamic state change
      transaction.update(playerRef, {
        status: targetStatus,
        // Pro-tip: Automatically log timestamps if the status shifts to ANSWERED
        ...(targetStatus === PlayerStatus.ANSWERED && { lastScoreUpdateTime: Date.now() }),
      });
    });

    return { success: true };
  } catch (error: any) {
    // Senior Move: Wrap raw errors cleanly so client components don't crash
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', error.message || 'Transaction failed.');
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
    const playerRef = roomRef.collection('players').doc(playerName);

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
