import { Component, computed, inject, input, model, signal, Signal } from '@angular/core';
import { QuizTimer } from '../../quiz-timer/quiz-timer';
import { QuizProgress } from '../../quiz-progress/quiz-progress';

import { BehaviorSubject } from 'rxjs';
import { Question } from '@models/quiz/question.model';

import { CommonModule } from '@angular/common';
import { QuestionOptionButton } from '../../../../../components/question-option-button/question-option-button';
import { QuestionText } from '../../question-text/question-text';
import { GameService } from '@services/quiz/game.service';
import { PlayerStatus } from '@models/quiz/player.model';
import { SessionService } from '@services/session/session.service';

@Component({
  selector: 'app-question-screen',
  imports: [QuizTimer, QuizProgress, QuestionText, QuestionOptionButton, CommonModule],
  templateUrl: './question-screen.html',
  styleUrl: './question-screen.css',
  standalone: true,
})
export class QuestionScreen {
  private gameService = inject(GameService);
  private sessionService = inject(SessionService);

  revealed$ = new BehaviorSubject(false);
  currentQuestionIndex$ = new BehaviorSubject(0);
  activeQuestion = input<Question | undefined>(undefined);
  timer = input<number | undefined>(0);
  correctAnswer = model<boolean>();
  wrongAnswer = model<boolean>();

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

  checkAnswer(questionIndex: number, answerIndex: number) {
    if (answerIndex === questionIndex) {
      this.correctAnswer.set(true);
      this.gameService.setPlayerStatus(PlayerStatus.WAITING);
      this.gameService.updatePlayerScore();
    } else {
      this.wrongAnswer.set(true);
      this.gameService.setPlayerStatus(PlayerStatus.OFFLINE);
      this.sessionService.clearSession();
    }
  }

  timerRanOut() {
    if (this.activeQuestion()) {
      this.revealed$.next(true);
      setTimeout(() => {
        this.checkAnswer(this.activeQuestion()?.correctIndex!, this.selected()!);
      }, 900);
    }
  }

  onSelectOption(idx: number): void {
    this.selected.set(idx);
    this.gameService.setPlayerStatus(PlayerStatus.ANSWERED);
  }
}
