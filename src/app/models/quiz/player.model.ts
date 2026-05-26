export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface LeaderboardEntry extends Player {
  rank: number;
}
