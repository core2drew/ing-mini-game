import { LeaderboardPlayer } from '@models/quiz/leaderboard.model';

export function getTopLeaderboardPlayers<T extends LeaderboardPlayer>(
  players: T[],
  limit = 10,
): T[] {
  // Shallow clone to avoid mutating original state
  return [...players]
    .sort((playerA, playerB) => {
      // Axis 1: Score (Descending)
      if (playerB.score !== playerA.score) {
        return playerB.score - playerA.score;
      }

      // Axis 2: Timestamp Speed (Ascending - faster time wins)
      const timeA = playerA.lastScoreUpdateTime?.toMillis() ?? null;
      const timeB = playerB.lastScoreUpdateTime?.toMillis() ?? null;

      if (timeA !== null || timeB !== null) {
        if (timeA === null) return 1;
        if (timeB === null) return -1;
        if (timeA !== timeB) return timeA - timeB;
      }

      // Axis 3: Alphabetical Fallback
      return playerA.name.localeCompare(playerB.name);
    })
    .slice(0, limit); // Using slice() instead of splice() because it preserves intent without unexpected mutations
}
