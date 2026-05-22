import { Timestamp } from 'firebase/firestore';

export interface QuizSession {
  currentQuestionIndex: number;
  questionTimerExpiresAt: Timestamp;
}
