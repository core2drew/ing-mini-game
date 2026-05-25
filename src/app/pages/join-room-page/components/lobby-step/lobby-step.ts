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
import { IdleTextDot } from '../../../../components/idle-text-dot/idle-text-dot';

@Component({
  selector: 'app-lobby-step',
  imports: [TableModule, CommonModule, LogoTitle, IdleTextDot],
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

  getAvatarColorByName = (name: string | null) => {
    const defaultColor = '#3b82f6'; // Fallback Electric Blue
    const alphabetAvatarColors: Record<string, string> = {
      A: '#ec4899', // Hot Pink
      B: '#3b82f6', // Electric Blue
      C: '#10b981', // Crisp Emerald
      D: '#f59e0b', // Glowing Amber
      E: '#8b5cf6', // Vivid Purple
      F: '#f97316', // Safety Orange
      G: '#06b6d4', // Bright Cyan
      H: '#f43f5e', // Radiant Rose
      I: '#84cc16', // Vibrant Lime
      J: '#6366f1', // Indigo
      K: '#14b8a6', // Fresh Teal
      L: '#a855f7', // Radiant Violet
      M: '#ff6b6b', // Coral Red
      N: '#22c55e', // Neon Green
      O: '#e11d48', // Crimson Accent
      P: '#0284c7', // Sky Sky Blue
      Q: '#d946ef', // Fuchsia
      R: '#4f46e5', // Deep Royal Indigo
      S: '#059669', // Dark Emerald
      T: '#ea580c', // Burnt Orange
      U: '#9333ea', // Deep Purple
      V: '#0891b2', // Deep Cyan
      W: '#c026d3', // Deep Magenta
      X: '#475569', // Medium Slate (Cool Neutrals)
      Y: '#64748b', // Light Slate
      Z: '#0d9488', // Deep Teal
    };

    if (!name || typeof name !== 'string') return defaultColor;

    // Grab the very first letter and capitalize it
    const firstLetter = name.trim().charAt(0).toUpperCase();

    // If it's a valid A-Z letter, return its dedicated color
    if (alphabetAvatarColors[firstLetter]) {
      return alphabetAvatarColors[firstLetter];
    }

    // Fallback for numbers or symbols: use a consistent fallback index via charCode
    const keys = Object.keys(alphabetAvatarColors);
    const fallbackIndex = firstLetter.charCodeAt(0) % keys.length;
    return alphabetAvatarColors[keys[fallbackIndex]];
  };

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
