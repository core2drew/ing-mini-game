import { Component, computed, inject, input, signal, Signal } from '@angular/core';
import { QuizTimer } from '../../quiz-timer/quiz-timer';
import { QuizProgress } from '../../quiz-progress/quiz-progress';

import { BehaviorSubject } from 'rxjs';
import { Question } from '@models/quiz/question.model';
import { QuestionService } from '@services/quiz/question.service';
import { CommonModule } from '@angular/common';
import { QuestionOptionButton } from '../../../../../components/question-option-button/question-option-button';
import { QuestionText } from '../../question-text/question-text';

@Component({
  selector: 'app-question-screen',
  imports: [QuizTimer, QuizProgress, QuestionText, QuestionOptionButton, CommonModule],
  templateUrl: './question-screen.html',
  styleUrl: './question-screen.css',
  standalone: true,
})
export class QuestionScreen {
  private questionService = inject(QuestionService);
  revealed$ = new BehaviorSubject(false);
  currentQuestionIndex$ = new BehaviorSubject(0);
  activeQuestion = input<Question | undefined>(undefined);
  timer = input<number | undefined>(0);
  readonly selected = signal<number | null>(null);

  readonly answerIsCorrect = computed(() => {
    const selectedIndex = this.selected();
    if (selectedIndex === null) return false;
    return selectedIndex === this.activeQuestion()?.correctIndex;
  });

  get isRevealed(): boolean {
    return this.revealed$.value;
  }

  get currentQuestion(): Signal<Question | null | undefined> {
    return this.activeQuestion;
  }

  get progressPercent(): number {
    return (this.currentQuestionIndex$.value / 20) * 100;
  }

  timerRanOut() {
    if (this.activeQuestion()) {
      this.revealed$.next(true);
      setTimeout(() => {
        if (this.activeQuestion()?.correctIndex !== this.selected()) {
          this.questionService.wrongAnswer.set(true);
        } else {
          this.questionService.checkAnswer(this.activeQuestion()?.correctIndex!, this.selected()!);
        }
      }, 900);
    }
  }

  onSelectOption(idx: number): void {
    this.selected.set(idx);
  }
}
