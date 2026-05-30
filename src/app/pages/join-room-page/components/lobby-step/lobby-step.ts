import { CommonModule } from '@angular/common';
import { Component, inject, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@models/quiz/player.model';

import { TableModule } from 'primeng/table';
import { filter, switchMap } from 'rxjs';
import { LogoTitle } from '../logo-title/logo-title';
import { IdleTextDot } from '../../../../components/idle-text-dot/idle-text-dot';
import { GameService } from '@services/quiz/game.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Avatar } from '../../../../components/avatar/avatar';
import { SessionService } from '@services/session/session.service';
import { QuizSessionStatus } from '@models/quiz/quiz-session.model';

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

  players: Signal<Player[] | undefined> = signal(undefined);

  constructor() {
    this.players = toSignal(this.gameService.getPlayersInRoom(this.sessionService.roomId()!));
    this.listenToGameEvents();
  }

  private listenToGameEvents(): void {
    // Convert the roomId Signal to an Observable that reacts if the ID changes
    const roomId$ = toObservable(this.sessionService.roomId).pipe(
      filter((id): id is string => !!id), // Only proceed if id is truthy
    );

    // 1. Handle Game Start
    roomId$
      .pipe(
        switchMap((id) => this.gameService.watchQuizSessionStatus(id)),
        takeUntilDestroyed(), // Automatically cleans up when component destroys
      )
      .subscribe({
        next: (status) => {
          if (status === QuizSessionStatus.WAITING) {
            this.router.navigate(['/join']);
            return;
          }
          if (status === QuizSessionStatus.STARTED) {
            this.router.navigate(['/quiz-blitz']);

            return;
          }
          if (status === QuizSessionStatus.ENDED) {
            this.router.navigate(['/']);
            this.sessionService.clearSession();
            return;
          }
        },
        error: (err) => console.error('Error listening to game start:', err),
      });
  }
}
