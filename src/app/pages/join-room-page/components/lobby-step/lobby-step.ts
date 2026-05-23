import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@models/quiz/player.model';
import { PlayerService } from '@services/quiz/player.service';
import { RoomService } from '@services/room/room.service';
import { playerStore } from '@stores/player.store';
import { TableModule } from 'primeng/table';
import { Observable, of, Subscription } from 'rxjs';
import { LogoTitle } from '../logo-title/logo-title';

@Component({
  selector: 'app-lobby-step',
  imports: [TableModule, CommonModule, LogoTitle],
  templateUrl: './lobby-step.html',
  styleUrl: './lobby-step.css',
  standalone: true,
})
export class LobbyStep {
  private router = inject(Router);
  private roomService = inject(RoomService);
  private playerService = inject(PlayerService);

  private gameStartSub!: Subscription;
  private gameEndSub!: Subscription;
  players$: Observable<Player[]> = of([]);
  dots = [0, 1, 2];

  getColorByName(name: string | null): string {
    const avatarColors = [
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#6366f1',
      '#ef4444',
      '#14b8a6',
      '#06b6d4',
      '#f97316',
      '#84cc16',
      '#d946ef',
      '#a855f7',
      '#1d4ed8',
      '#047857',
      '#b91c1c',
      '#4338ca',
      '#6b7280',
      '#0f172a',
    ];
    if (!name || typeof name !== 'string') return avatarColors[0];

    // 1. Get the first letter, uppercase it, and get its ASCII character code
    const firstLetter = name.trim().charAt(0).toUpperCase();
    const charCode = firstLetter.charCodeAt(0);

    // 2. Use the modulo operator (%) to map the character code to an index in the array
    const colorIndex = charCode % avatarColors.length;

    return avatarColors[colorIndex];
  }

  ngOnInit(): void {
    const currentRoomId = playerStore.getValue().roomId;

    if (!currentRoomId) {
      console.error('No active room found, redirecting back to home.');
      this.router.navigate(['/']);
      return;
    }

    this.players$ = this.playerService.getPlayersInRoom(currentRoomId!);

    this.gameStartSub = this.roomService.waitUntilGameStarts(currentRoomId).subscribe({
      next: (isStarted) => {
        if (isStarted) {
          console.log('Game has started! Redirecting to arena...');
          this.router.navigate(['/quiz-blitz']);
        }
      },
      error: (err) => console.error('Error listening to room status:', err),
    });

    this.gameEndSub = this.roomService.waitUntilGameEnds(currentRoomId).subscribe({
      next: (isEnded) => {
        if (isEnded) {
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
