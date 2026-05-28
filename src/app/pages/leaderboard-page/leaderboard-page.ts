import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@services/quiz/game.service';
import { getAvatarColorByName, getPlayerStatusLabel } from '@utils/player-utils';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { map, switchMap, tap } from 'rxjs';
import { Avatar } from '../../components/avatar/avatar';
import { getTopLeaderboardPlayers } from '@utils/leaderboard.utils';

@Component({
  selector: 'app-leaderboard-page',
  imports: [TableModule, SkeletonModule, CommonModule, Avatar],
  templateUrl: './leaderboard-page.html',
  styleUrl: './leaderboard-page.css',
})
export class LeaderboardPage {
  private gameService = inject(GameService);
  private route = inject(ActivatedRoute);

  loading = signal(true);

  stats = signal({
    totalPlayers: 0,
    highestScore: 0,
    totalGames: 0,
  });

  players = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('roomId')),
      tap(() => this.loading.set(true)),

      switchMap((roomId) => this.gameService.getPlayersInRoom(roomId!)),
      map((players) =>
        players.map((player) => ({
          ...player,
          avatarColor: getAvatarColorByName(player.name),
          statusText: getPlayerStatusLabel(player.status!),
        })),
      ),
      tap({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      }),
    ),
    { initialValue: [] },
  );

  leaderboardPlayers = computed(() => getTopLeaderboardPlayers(this.players()));

  getRankConfig(index: number, score: number | undefined | null) {
    // If there is no valid score, return a neutral fallback styling
    if (!score || score <= 0) {
      return {
        bg: 'bg-slate-800/30 border border-slate-700/50',
        text: 'text-slate-500 font-normal text-sm',
        content: '-',
      };
    }

    // Medal configurations for top 3 positions
    const topRanks: Record<number, { bg: string; text: string; content: string }> = {
      0: { bg: 'from-amber-400 to-amber-600 shadow-lg', text: 'text-lg', content: '🥇' },
      1: { bg: 'from-slate-300 to-slate-500 shadow-lg', text: 'text-lg', content: '🥈' },
      2: { bg: 'from-orange-400 to-orange-600 shadow-lg', text: 'text-lg', content: '🥉' },
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
}
