import { Component, inject, Input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideX } from '@lucide/angular';
import { SessionService } from '@services/session/session.service';
import { getWrongRandomInspirationalMessage } from '@utils/inspirational-message-utils';

@Component({
  selector: 'app-wrong-answer-screen',
  imports: [LucideX],
  templateUrl: './wrong-answer-screen.html',
  styleUrl: './wrong-answer-screen.css',
  standalone: true,
})
export class WrongAnswerScreen {
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
