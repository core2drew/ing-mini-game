import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@models/quiz/player.model';
import { PlayerService } from '@services/quiz/player.service';
import { RoomService } from '@services/room/room.service';
import { playerStore } from '@stores/player.store';
import { TableModule } from 'primeng/table';
import { Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby-step',
  imports: [TableModule, CommonModule],
  templateUrl: './lobby-step.html',
  styleUrl: './lobby-step.css',
  standalone: true,
})
export class LobbyStep {
  private router = inject(Router);
  private roomService = inject(RoomService);
  private playerService = inject(PlayerService);

  private gameStartSub!: Subscription;
  players$: Observable<Player[]> = of([]);

  ngOnInit(): void {
    // 1. Fetch the active roomId out of your Elf store
    const currentRoomId = playerStore.getValue().roomId;

    if (!currentRoomId) {
      console.error('No active room found, redirecting back to home.');
      this.router.navigate(['/']);
      return;
    }

    this.players$ = this.playerService.getPlayersInRoom(currentRoomId!);

    // 2. Start watching for the host to click "Start Game"
    this.gameStartSub = this.roomService.waitUntilGameStarts(currentRoomId).subscribe({
      next: (isStarted) => {
        if (isStarted) {
          console.log('Game has started! Redirecting to arena...');
          // 3. Move the player out of the lobby into the active match
          this.router.navigate(['/quiz-blitz']);
        }
      },
      error: (err) => console.error('Error listening to room status:', err),
    });
  }

  ngOnDestroy(): void {
    // Clean up just in case the player leaves the lobby page manually before the game starts
    if (this.gameStartSub) {
      this.gameStartSub.unsubscribe();
    }
  }
}
