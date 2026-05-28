import { Time } from '@angular/common';
import { Timestamp } from 'firebase/firestore';

export enum PlayerStatus {
  WAITING = 1,
  THINKING = 2,
  ANSWERED = 3,
  OFFLINE = 4,
}

export const PlayerStatusLabel: Record<PlayerStatus, string> = {
  [PlayerStatus.WAITING]: 'Waiting',
  [PlayerStatus.THINKING]: 'Thinking',
  [PlayerStatus.ANSWERED]: 'Answered',
  [PlayerStatus.OFFLINE]: 'Offline',
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
