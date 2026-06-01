import { Component, effect, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { Question } from '@models/quiz/question.model';
import { QuestionOptionButton } from '../../../../../../components/question-option-button/question-option-button';
import { CommonModule } from '@angular/common';
import { QuizSessionStatus } from '@models/quiz/quiz-session.model';

@Component({
  selector: 'app-question-view',
  imports: [
    CardModule,
    ButtonModule,
    DividerModule,
    ChipModule,
    QuestionOptionButton,
    CommonModule,
  ],
  templateUrl: './question-view.html',
  styleUrl: './question-view.css',
})
export class QuestionView {
  nextQuestion = output<void>();

  currentQuestion = input<Question | null>();
  currentCategory = input<string>('');
  questionTimer = input<number>();
  questionLength = input<number>();
  quizSessionStatus = input<QuizSessionStatus>();
  isProcessing = input<boolean>();

  get questionNumber() {
    return this.currentQuestion()?.questionNumber || 1;
  }

  get questionCategory() {
    return this.currentQuestion()?.category || 'General';
  }

  get isGameStarted() {
    return this.quizSessionStatus() === QuizSessionStatus.STARTED;
  }
}
