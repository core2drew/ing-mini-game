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
import { getRankConfig, getTopLeaderboardPlayers } from '@utils/leaderboard.utils';

@Component({
  selector: 'app-leaderboard-page',
  imports: [TableModule, SkeletonModule, CommonModule, Avatar],
  templateUrl: './leaderboard-page.html',
  styleUrl: './leaderboard-page.css',
})
export class LeaderboardPage {
  private gameService = inject(GameService);
  private route = inject(ActivatedRoute);
  protected getRankConfig = getRankConfig;

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
}
