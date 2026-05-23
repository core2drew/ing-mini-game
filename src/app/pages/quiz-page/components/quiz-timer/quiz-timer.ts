import { CommonModule } from '@angular/common';
import { Component, effect, input, output } from '@angular/core';

@Component({
  selector: 'app-quiz-timer',
  imports: [CommonModule],
  templateUrl: './quiz-timer.html',
  styleUrl: './quiz-timer.css',
  standalone: true,
})
export class QuizTimer {
  secondsLeft = input<number>(0);

  onZeroReached = output<void>();

  constructor() {
    effect(() => {
      const currentSeconds = this.secondsLeft();
      if (currentSeconds <= 0) {
        this.onZeroReached.emit();
      }
    });
  }
}
