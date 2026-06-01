import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Player, PlayerStatus } from '@models/quiz/player.model';

import { TableModule } from 'primeng/table';
import { filter, map, switchMap } from 'rxjs';
import { LogoTitle } from '../logo-title/logo-title';
import { IdleTextDot } from '../../../../components/idle-text-dot/idle-text-dot';
import { GameService } from '@services/quiz/game.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Avatar } from '../../../../components/avatar/avatar';
import { SessionService } from '@services/session/session.service';
import { QuizSessionStatus } from '@models/quiz/quiz-session.model';
import { PlayerService } from '@services/quiz/player.service';

@Component({
  selector: 'app-lobby-step',
  imports: [TableModule, CommonModule, LogoTitle, IdleTextDot, Avatar],
  templateUrl: './lobby-step.html',
  styleUrl: './lobby-step.css',
  standalone: true,
})
export class LobbyStep {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);
  private playerService = inject(PlayerService);

  readonly playerName = this.sessionService.playerName();
  private readonly roomId = this.sessionService.roomId();
  readonly player = toSignal(this.playerService.getPlayer(this.roomId!, this.playerName!));

  players: Signal<Player[] | undefined> = signal(undefined);

  constructor() {
    this.players = toSignal(
      this.gameService.getPlayersInRoom(this.sessionService.roomId()!).pipe(
        map((players) => {
          return [...players].sort((a, b) => {
            if (a.name === this.playerName) return -1;
            if (b.name === this.playerName) return 1;
            return a.name.localeCompare(b.name); // Sort the rest alphabetically
          });
        }),
      ),
    );
    this.listenToGameEvents();
  }

  private listenToGameEvents(): void {
    // Convert the roomId Signal to an Observable that reacts if the ID changes

    const sessionStatus = toSignal(
      toObservable(this.sessionService.roomId).pipe(
        filter((id): id is string => !!id),
        switchMap((id) => this.gameService.watchQuizSessionStatus(id)),
      ),
    );

    // 1. Handle Game Start
    effect(() => {
      const status = sessionStatus();
      const player = this.player(); // Reacts automatically if player updates too

      if (!status) return; // Handle initial undefined state from toSignal

      if (status === QuizSessionStatus.STARTED) {
        this.router.navigate(['/quiz-blitz']);
        return;
      }

      if (
        status === QuizSessionStatus.ENDED &&
        (player?.status === PlayerStatus.COMPLETED || player?.status === PlayerStatus.OFFLINE)
      ) {
        this.router.navigate(['/quiz-blitz']);
        return;
      }

      this.router.navigate(['/join']);
    });
  }
}
