import { Timestamp } from 'firebase/firestore';

export interface QuizSession {
  currentQuestionId: string;
  currentQuestionIndex: number;
  questionTimerExpiresAt: Timestamp;
}
