import { Timestamp } from 'firebase/firestore';

export enum QuizSessionStatus {
  WAITING = 1,
  STARTED = 2,
  ENDED = 3,
}
export const QuizSessionStatusLabel: Record<QuizSessionStatus, string> = {
  [QuizSessionStatus.WAITING]: 'Waiting',
  [QuizSessionStatus.STARTED]: 'Started',
  [QuizSessionStatus.ENDED]: 'Ended',
};

export interface QuizSession {
  currentQuestionIndex: number;
  questionTimerExpiresAt: Timestamp;
  status: QuizSessionStatus;
}
