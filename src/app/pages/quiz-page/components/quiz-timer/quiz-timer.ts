import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';

const TOTAL_SECONDS = 10;
const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54
@Component({
  selector: 'app-quiz-timer',
  imports: [CommonModule],
  templateUrl: './quiz-timer.html',
  styleUrl: './quiz-timer.css',
  standalone: true,
})
export class QuizTimer {
  readonly circumference = CIRCUMFERENCE;
  timeLeft = input<number>(0);

  urgency = computed(() => this.timeLeft() <= 5);
  timerColor = computed(() => {
    const ratio = this.timeLeft() / TOTAL_SECONDS;
    if (ratio > 0.5) return '#22c55e';
    if (ratio > 0.25) return '#f59e0b';
    return '#ef4444';
  });
  dashOffset = computed(() => CIRCUMFERENCE * (1 - this.timeLeft() / TOTAL_SECONDS));

  onZeroReached = output<void>();

  constructor() {
    effect(() => {
      const currentSeconds = this.timeLeft();
      if (currentSeconds <= 0) {
        this.onZeroReached.emit();
      }
    });
  }
}
