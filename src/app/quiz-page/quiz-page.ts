import { Component } from '@angular/core';
import { QuestionText } from './components/question-text/question-text';
import { QuestionOptionButton } from './components/question-option-button/question-option-button';
import { QuizProgress } from './components/quiz-progress/quiz-progress';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Question } from '@models/quiz/question.model';
import { QuestionService } from '@services/quiz/question.service';

@Component({
  selector: 'app-quiz-page',
  imports: [QuestionText, QuestionOptionButton, QuizProgress, CommonModule],
  templateUrl: './quiz-page.html',
  styleUrl: './quiz-page.css',
  standalone: true,
})
export class QuizPage {
  playerId: string = '';
  questions: Question[] = [];

  currentQuestion$ = new BehaviorSubject(0);
  revealed$ = new BehaviorSubject(false);
  selected$ = new BehaviorSubject<number | null>(null);
  answers$ = new BehaviorSubject<number[]>([]);
  score$ = new BehaviorSubject(0);
  finished$ = new BehaviorSubject(false);

  private destroy$ = new Subject<void>();

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.questions = this.questionService.getQuestions();
  }

  get progressPercent(): number {
    return (this.currentQuestion$.value / this.questions.length) * 100;
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestion$.value];
  }

  get isRevealed(): boolean {
    return this.revealed$.value;
  }

  onSelectOption(idx: number): void {
    if (this.selected$.value !== null) return;
    this.selected$.next(idx);
    this.revealed$.next(true);
  }
}
