import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-quiz-progress',
  imports: [CommonModule],
  templateUrl: './quiz-progress.html',
  styleUrl: './quiz-progress.css',
  standalone: true,
})
export class QuizProgress {
  @Input() progress: number = 0;
  @Input() currentQuestionNumber: number = 1;
  @Input() questionLength: number = 1;
}
