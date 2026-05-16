import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-question-text',
  imports: [],
  templateUrl: './question-text.html',
  styleUrl: './question-text.css',
  standalone: true,
})
export class QuestionText {
  @Input() question: string = '';
}
