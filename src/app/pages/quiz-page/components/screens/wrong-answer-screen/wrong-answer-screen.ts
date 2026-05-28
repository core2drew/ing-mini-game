import { Component, inject, Input, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideX, LucideCheck } from '@lucide/angular';
import { getWrongRandomInspirationalMessage } from '@utils/inspirational-message-utils';

@Component({
  selector: 'app-wrong-answer-screen',
  imports: [LucideX, LucideCheck],
  templateUrl: './wrong-answer-screen.html',
  styleUrl: './wrong-answer-screen.css',
  standalone: true,
})
export class WrongAnswerScreen {
  private router = inject(Router);

  sparks = Array.from({ length: 14 }, (_, i) => ({
    angle: (360 / 14) * i,
    delay: (i * 0.05).toFixed(2),
  }));
  showContent = signal(true);
  shakeActive = signal(true);

  inspirationalMessage = signal(getWrongRandomInspirationalMessage());

  @Input() correctAnswer: string | undefined = '';

  exitQuiz(): void {
    this.router.navigate(['/']);
  }
}
