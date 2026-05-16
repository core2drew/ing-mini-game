export interface Player {
  id: string;
  name: string;
  score: number;
  answers: number[];
  joined_at: Date;
  completed_at?: Date;
}

export interface LeaderboardEntry extends Player {
  rank: number;
}
