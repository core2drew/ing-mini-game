export interface Player {
  id: string;
  name: string;
  score: number;
  hasAnswered?: boolean;
}

export interface LeaderboardEntry extends Player {
  rank: number;
}
