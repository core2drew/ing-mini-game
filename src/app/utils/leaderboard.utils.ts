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

export function getRankConfig(index: number, score: number | undefined | null = null) {
  // If there is no valid score, return a neutral fallback styling
  console.log(index);
  if (!score || score <= 0) {
    return {
      bg: 'bg-slate-800/30 border border-slate-700/50',
      text: 'text-slate-500 font-normal text-sm',
      content: '-',
    };
  }

  // Medal configurations for top 3 positions
  const topRanks: Record<number, { bg: string; text: string; content: string }> = {
    0: {
      bg: 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg',
      text: 'text-lg',
      content: '🥇',
    },
    1: {
      bg: 'bg-gradient-to-r from-slate-400 to-slate-600 shadow-lg',
      text: 'text-lg',
      content: '🥈',
    },
    2: {
      bg: 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg',
      text: 'text-lg',
      content: '🥉',
    },
  };

  // Return the medal configuration, or the fallback for rank 4+ with a score
  return (
    topRanks[index] ?? {
      bg: 'bg-slate-700/50',
      text: 'text-slate-300 font-medium text-sm',
      content: `#${index + 1}`,
    }
  );
}
