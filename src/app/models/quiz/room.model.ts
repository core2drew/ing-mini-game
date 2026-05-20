import { Timestamp } from 'firebase/firestore';
import { QuizSession } from './quiz-session.model';

export interface Room {
  id: string;
  createdAt: Timestamp;
  isEnded: boolean;
  isStarted: boolean;
  quizSession: QuizSession;
}
