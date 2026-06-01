import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '@services/session/session.service';
import { getCorrectRandomInspirationalMessage } from '@utils/inspirational-message-utils';
import { Avatar } from '../../../../../components/avatar/avatar';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlayerService } from '@services/quiz/player.service';

@Component({
  selector: 'app-complete-screen',
  imports: [Avatar],
  templateUrl: './complete-screen.html',
  styleUrl: './complete-screen.css',
})
export class CompleteScreen {
  private playerService = inject(PlayerService);
  private readonly sessionService = inject(SessionService);
  private router = inject(Router);

  confetti = signal<{ x: number; delay: number; color: string; size: number; dur: number }[]>([]);
  showContent = signal(false);
  inspirationalMessage = signal(getCorrectRandomInspirationalMessage());
  private readonly roomId = this.sessionService.roomId();
  private readonly playerName = this.sessionService.playerName();
  readonly player = toSignal(this.playerService.getPlayer(this.roomId!, this.playerName!));
  private colors = ['#22c55e', '#86efac', '#4ade80', '#fbbf24', '#34d399', '#a3e635'];

  ngOnInit(): void {
    this.confetti.set(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        delay: Math.random() * 1.5,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        size: 6 + Math.random() * 8,
        dur: 2 + Math.random() * 2,
      })),
    );
    setTimeout(() => this.showContent.set(true), 100);
  }
}
