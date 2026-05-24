import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-wrong-answer-screen',
  imports: [LucideX],
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

  exitQuiz(): void {
    this.router.navigate(['/']);
  }
}
