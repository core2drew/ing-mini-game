import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-quiz-progress',
  imports: [],
  templateUrl: './quiz-progress.html',
  styleUrl: './quiz-progress.css',
  standalone: true,
})
export class QuizProgress {
  @Input() progress: number = 0;
}
