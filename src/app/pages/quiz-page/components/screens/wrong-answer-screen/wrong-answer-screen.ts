import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideX, LucideCheck } from '@lucide/angular';

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

  getRandomInspirationalMessage() {
    const inspirationMessages = [
      `Just call it a "creative choice" and move on.`,
      `On the bright side, you just learned one definitive way not to do it.`,
      `Erasers exist for a reason. If we were perfect, pencils wouldn't have them.`,
      `Don't worry, nobody was looking (hopefully).`,
      `Well, at least you gave the universe a plot twist.`,
      `Perfect people are boring anyway.`,
      `Don't worry — every mistake is just a lesson in disguise.`,
      `At least you're being consistent at keeping life unpredictable.`,
      `That wasn't a blunder, it was a highly calculated risk... that just happened to backfire.`,
    ];
    return inspirationMessages[Math.floor(Math.random() * inspirationMessages.length)];
  }

  inspirationMessage = signal(this.getRandomInspirationalMessage());

  exitQuiz(): void {
    this.router.navigate(['/']);
  }
}
