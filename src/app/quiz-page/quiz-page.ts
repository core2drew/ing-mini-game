import { Component } from '@angular/core';
import { Question } from './components/question/question';
import { QuestionOptions } from './components/question-options/question-options';
import { QuizProgress } from './components/quiz-progress/quiz-progress';

@Component({
  selector: 'app-quiz-page',
  imports: [Question, QuestionOptions, QuizProgress],
  templateUrl: './quiz-page.html',
  styleUrl: './quiz-page.css',
  standalone: true,
})
export class QuizPage {}
