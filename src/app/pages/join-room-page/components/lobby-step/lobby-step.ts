import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Player, PlayerStatus, PlayerWithUIData } from '@models/quiz/player.model';

import { RoomService } from '@services/room/room.service';
import { sessionStore } from '@stores/session.store';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { LogoTitle } from '../logo-title/logo-title';
import { IdleTextDot } from '../../../../components/idle-text-dot/idle-text-dot';
import { GameService } from '@services/quiz/game.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { getAvatarColorByName } from '@utils/player-utils';
import { Avatar } from '../../../../components/avatar/avatar';
import { SessionService } from '@services/session/session.service';

@Component({
  selector: 'app-lobby-step',
  imports: [TableModule, CommonModule, LogoTitle, IdleTextDot, Avatar],
  templateUrl: './lobby-step.html',
  styleUrl: './lobby-step.css',
  standalone: true,
})
export class LobbyStep {
  private router = inject(Router);
  private roomService = inject(RoomService);
  private gameService = inject(GameService);
  private sessionService = inject(SessionService);

  private gameStartSub!: Subscription;
  private gameEndSub!: Subscription;

  players: Signal<Player[] | undefined> = signal(undefined);

  constructor() {
    const roomId = sessionStore.getValue().roomId;
    if (!roomId) {
      console.error('No active room found, redirecting back to home.');
      this.router.navigate(['/']);
      return;
    }

    this.players = toSignal(this.gameService.getPlayersInRoom(roomId!));

    this.gameStartSub = this.roomService.waitUntilGameStarts(roomId).subscribe({
      next: (isStarted) => {
        if (isStarted) {
          console.log('Game has started! Redirecting to arena...');
          this.router.navigate(['/quiz-blitz']);
        }
      },
      error: (err) => console.error('Error listening to room status:', err),
    });

    this.gameEndSub = this.roomService.waitUntilGameEnds(roomId).subscribe({
      next: (isEnded) => {
        if (isEnded) {
          this.gameService.setPlayerStatus(PlayerStatus.OFFLINE);
          this.sessionService.leaveRoom();
          console.log('Game has ended! Redirecting to home...');
          location.reload();
        }
      },
      error: (err) => console.error('Error listening to room status:', err),
    });
  }

  ngOnDestroy(): void {
    if (this.gameStartSub) {
      this.gameStartSub.unsubscribe();
    }

    if (this.gameEndSub) {
      this.gameEndSub.unsubscribe();
    }
  }
}
