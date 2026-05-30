import { Timestamp } from 'firebase/firestore';

export enum PlayerStatus {
  WAITING = 1,
  THINKING = 2,
  ANSWERED = 3,
  CORRECT = 4,
  WRONG = 5,
  OFFLINE = 6,
}

export const PlayerStatusLabel: Record<PlayerStatus, string> = {
  [PlayerStatus.WAITING]: 'Waiting', // Lobby
  [PlayerStatus.THINKING]: 'Thinking', // Quiz
  [PlayerStatus.ANSWERED]: 'Answered', // Quiz
  [PlayerStatus.CORRECT]: 'Correct', // Quiz
  [PlayerStatus.WRONG]: 'Wrong', // Quiz
  [PlayerStatus.OFFLINE]: 'Offline', // Admin player status
};

export interface Player {
  id: string;
  name: string;
  score: number;
  hasAnswered?: boolean;
  status?: PlayerStatus;
  lastScoreUpdateTime?: Timestamp | null;
}

export interface PlayerWithUIData extends Player {
  statusText?: string;
}

export interface LeaderboardEntry extends Player {
  rank: number;
}
