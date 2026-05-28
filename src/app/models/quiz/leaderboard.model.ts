export interface LeaderboardPlayer {
  name: string;
  score: number;
  lastScoreUpdateTime?: {
    toMillis(): number;
  } | null;
}
