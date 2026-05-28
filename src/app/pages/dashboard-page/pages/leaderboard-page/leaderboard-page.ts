import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { LeaderboardRow } from '@models/quiz/leaderboard.model';
import { GameService } from '@services/quiz/game.service';
import { getAvatarColorByName, getPlayerStatusLabel } from '@utils/player-utils';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-leaderboard-page',
  imports: [TableModule, SkeletonModule, CommonModule],
  templateUrl: './leaderboard-page.html',
  styleUrl: './leaderboard-page.css',
})
export class LeaderboardPage {
  private gameService = inject(GameService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  leaderboardData = signal<LeaderboardRow[]>([]);
  lastUpdated = signal(new Date());

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

  leaderboardPlayers = computed(() => {
    const activePool = [...this.players()];
    const sortedPool = activePool.sort((playerA, playerB) => {
      // Axis 1: Score
      if (playerB.score !== playerA.score) {
        return playerB.score - playerA.score;
      }

      // Axis 2: Timestamp Speed
      const timeA = playerA.lastScoreUpdateTime?.toMillis() ?? null;
      const timeB = playerB.lastScoreUpdateTime?.toMillis() ?? null;

      if (timeA !== null || timeB !== null) {
        if (timeA === null) return 1;
        if (timeB === null) return -1;
        if (timeA !== timeB) return timeA - timeB;
      }

      return playerA.name.localeCompare(playerB.name);
    });

    return sortedPool.splice(0, 10);
  });

  getRowClass(rank: number): string {
    if (rank === 1) {
      return 'bg-gradient-to-r from-amber-900/20 to-transparent hover:from-amber-900/30';
    } else if (rank === 2) {
      return 'bg-gradient-to-r from-slate-600/20 to-transparent hover:from-slate-600/30';
    } else if (rank === 3) {
      return 'bg-gradient-to-r from-orange-900/20 to-transparent hover:from-orange-900/30';
    }
    return 'hover:bg-slate-700/30';
  }
}
