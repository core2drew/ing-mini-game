export enum PlayerStatus {
  WAITING = 0,
  THINKING = 1,
  ANSWERED = 2,
  OFFLINE = 3,
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
  avatarColor?: string;
  status?: PlayerStatus;
  statusText?: string;
}

export interface LeaderboardEntry extends Player {
  rank: number;
}
