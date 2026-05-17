import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-quiz-timer',
  imports: [CommonModule],
  templateUrl: './quiz-timer.html',
  styleUrl: './quiz-timer.css',
  standalone: true,
})
export class QuizTimer {
  secondsLeft = input<number>(0);
}
