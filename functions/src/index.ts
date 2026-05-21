/* eslint-disable */
import { onRequest, onCall } from 'firebase-functions/v2/https';
import { CloudTasksClient } from '@google-cloud/tasks';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/options';

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

    let nextTaskData:
      | {
          roomId: string;
          nextIndex: number;
          nextExpiryDate: Date;
        }
      | undefined = undefined;

    // Use a transaction to prevent race conditions (e.g., if double-triggered)
    nextTaskData = await firestore.runTransaction(async (transaction) => {
      const roomDoc = await transaction.get(roomRef);

      if (!roomDoc.exists) {
        throw new Error('Room not found');
      }

      const roomData = roomDoc.data()!;
      const currentQuestionIndex = roomData.currentQuestionIndex || 0;

      const questionRef = roomRef.collection('questions').doc(currentQuestionIndex.toString());
      const questionDoc = await transaction.get(questionRef);
      console.log('Question data:', questionDoc.data());

      // Fetch the next question ID from your quiz definition
      if (!questionDoc.exists) {
        // No more questions left, end the quiz
        transaction.update(roomRef, {
          isEnded: false,
          isStarted: false,
          currentQuestionIndex: 0,
          expiresAt: null,
        });
        return;
      }

      const durationInSeconds = 10; // Customize per question if needed
      const nextExpiryDate = new Date(Date.now() + durationInSeconds * 1000);
      const nextExpiryTimestamp = Timestamp.fromDate(nextExpiryDate);
      const nextIndex = roomData.currentQuestionIndex + 1; // Next question index

      // Update Firestore State
      transaction.update(roomRef, {
        currentQuestionIndex: nextIndex,
        expiresAt: nextExpiryTimestamp,
      });

      return {
        roomId,
        nextIndex,
        nextExpiryDate,
      };
    });

    if (nextTaskData) {
      await scheduleNextQuestionTask(
        nextTaskData.roomId,
        nextTaskData.nextIndex,
        nextTaskData.nextExpiryDate,
      );
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
async function scheduleNextQuestionTask(roomId: string, nextIndex: number, scheduleTime: Date) {
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
      body: Buffer.from(JSON.stringify({ roomId, expectedQuestionIndex: nextIndex })).toString(
        'base64',
      ),
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

// Re-use the scheduling helper we wrote earlier
export const startQuiz = onCall(async (request) => {
  const { roomId } = request.data;
  const firestore = getFirestore();
  const roomRef = firestore.collection('rooms').doc(roomId);
  const durationInSeconds = 120;
  const firstExpiry = new Date(Date.now() + durationInSeconds * 1000);

  await roomRef.update({
    isStarted: true,
    'quizSession.currentQuestionIndex': 0,
    'quizSession.questionTimerExpiresAt': Timestamp.fromDate(firstExpiry),
  });

  // Kick off the automated background loop for index 0
  await scheduleNextQuestionTask(roomId, 0, firstExpiry);

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
  });

  return { success: true };
});
