import { Component, computed, effect, inject, input, model, signal, Signal } from '@angular/core';
import { QuizTimer } from '../../quiz-timer/quiz-timer';
import { QuizProgress } from '../../quiz-progress/quiz-progress';

import { BehaviorSubject, from } from 'rxjs';
import { Question } from '@models/quiz/question.model';

import { CommonModule } from '@angular/common';
import { QuestionOptionButton } from '../../../../../components/question-option-button/question-option-button';
import { QuestionText } from '../../question-text/question-text';
import { GameService } from '@services/quiz/game.service';
import { PlayerStatus } from '@models/quiz/player.model';
import { SessionService } from '@services/session/session.service';
import { QuestionService } from '@services/quiz/question.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-question-screen',
  imports: [QuizTimer, QuizProgress, QuestionText, QuestionOptionButton, CommonModule],
  templateUrl: './question-screen.html',
  styleUrl: './question-screen.css',
  standalone: true,
})
export class QuestionScreen {
  private gameService = inject(GameService);
  private questionService = inject(QuestionService);
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

  readonly questionLength = toSignal(
    from(this.questionService.getQuestionsLength(this.sessionService.roomId()!)),
  );

  get isRevealed(): boolean {
    return this.revealed$.value;
  }

  get currentQuestion(): Signal<Question | null | undefined> {
    return this.activeQuestion;
  }

  get progressPercent(): number {
    return ((this.activeQuestion()?.questionNumber || 0) / (this.questionLength() || 0)) * 100;
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
