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
    const { sessionId, expectedQuestionIndex } = req.body;

    if (!sessionId) {
      res.status(400).send('Missing sessionId');
      return;
    }

    const sessionRef = firestore.collection('sessions').doc(sessionId);
    let nextTaskData:
      | {
          sessionId: string;
          nextIndex: number;
          nextExpiryDate: Date;
        }
      | undefined = undefined;

    // Use a transaction to prevent race conditions (e.g., if double-triggered)
    nextTaskData = await firestore.runTransaction(async (transaction) => {
      const sessionDoc = await transaction.get(sessionRef);

      if (!sessionDoc.exists) {
        throw new Error('Session not found');
      }

      const sessionData = sessionDoc.data()!;

      // Concurrency Guard: Ensure we aren't skipping a question someone already advanced manually
      if (sessionData.currentQuestionIndex !== expectedQuestionIndex) {
        console.log('Task skipped: Question index mismatch (already advanced).');
        return;
      }

      const nextIndex = sessionData.currentQuestionIndex + 1;

      // Fetch the next question ID from your quiz definition
      const nextQuestionId = await getNextQuestionId(sessionData.quizId, nextIndex);

      if (!nextQuestionId) {
        // No more questions left, end the quiz
        transaction.update(sessionRef, {
          status: 'completed',
          expiresAt: null,
        });
        return;
      }

      const durationInSeconds = 30; // Customize per question if needed
      const nextExpiryDate = new Date(Date.now() + durationInSeconds * 1000);
      const nextExpiryTimestamp = Timestamp.fromDate(nextExpiryDate);

      // Update Firestore State
      transaction.update(sessionRef, {
        currentQuestionIndex: nextIndex,
        currentQuestionId: nextQuestionId,
        expiresAt: nextExpiryTimestamp,
      });

      return {
        sessionId,
        nextIndex,
        nextExpiryDate,
      };
    });

    if (nextTaskData) {
      await scheduleNextQuestionTask(
        nextTaskData.sessionId,
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
async function scheduleNextQuestionTask(sessionId: string, nextIndex: number, scheduleTime: Date) {
  const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
  const location = 'asia-east2';
  const queue = 'quiz-timer-queue'; // Must be created in Google Cloud Console

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
      body: Buffer.from(JSON.stringify({ sessionId, expectedQuestionIndex: nextIndex })).toString(
        'base64',
      ),
    },
    scheduleTime: {
      seconds: Math.floor(scheduleTime.getTime() / 1000),
    },
  };

  await tasksClient.createTask({ parent: queuePath, task });
}

async function getNextQuestionId(quizId: string, index: number): Promise<string | null> {
  // Logic to look up your static/dynamic quiz questions array or subcollection
  // Return null if index out of bounds
  return `question_id_${index}`;
}

// Re-use the scheduling helper we wrote earlier
export const startQuiz = onCall(async (request) => {
  const { roomId } = request.data;
  const firestore = getFirestore();

  const sessionRef = firestore.collection('rooms').doc(roomId);
  const durationInSeconds = 10;
  const firstExpiry = new Date(Date.now() + durationInSeconds * 1000);

  await sessionRef.update({
    isStarted: true,
    'quizSession.currentQuestionIndex': 0,
    'quizSession.currentQuestionId': await getNextQuestionId('defaultQuiz', 0),
    'quizSession.questionTimerExpiresAt': Timestamp.fromDate(firstExpiry),
  });

  // Kick off the automated background loop for index 0
  await scheduleNextQuestionTask(roomId, 0, firstExpiry);

  return { success: true };
});
