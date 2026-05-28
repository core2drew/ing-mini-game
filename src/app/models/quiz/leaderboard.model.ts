export interface LeaderboardRow {
  rank: number;
  id: string;
  username: string;
  score: number;
  avatar_url: string | null;
  games_played: number;
  wins: number;
  win_rate: number;
}
