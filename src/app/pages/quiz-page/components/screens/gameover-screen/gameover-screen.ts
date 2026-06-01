import { Component, inject, Input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideX } from '@lucide/angular';
import { SessionService } from '@services/session/session.service';
import { getWrongRandomInspirationalMessage } from '@utils/inspirational-message-utils';

@Component({
  selector: 'app-gameover-screen',
  imports: [LucideX],
  templateUrl: './gameover-screen.html',
  styleUrl: './gameover-screen.css',
})
export class GameoverScreen {
  private router = inject(Router);
  private sessionService = inject(SessionService);

  showContent = signal(true);
  shakeActive = signal(true);

  inspirationalMessage = signal(getWrongRandomInspirationalMessage());

  @Input() correctAnswer: string | undefined = '';

  exitQuiz(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/']);
  }
}
