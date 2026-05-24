import { Component, inject, Signal } from '@angular/core';
import { QuizTimer } from '../../quiz-timer/quiz-timer';
import { QuizProgress } from '../../quiz-progress/quiz-progress';
import { QuestionText } from '../../question-text/question-text';
import { QuestionOptionButton } from '../../question-option-button/question-option-button';
import { playerStore } from '@stores/player.store';
import { GameService } from '@services/quiz/game.service';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Question } from '@models/quiz/question.model';
import { QuestionService } from '@services/quiz/question.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-screen',
  imports: [QuizTimer, QuizProgress, QuestionText, QuestionOptionButton, CommonModule],
  templateUrl: './question-screen.html',
  styleUrl: './question-screen.css',
})
export class QuestionScreen {
  private gameService = inject(GameService);
  private questionService = inject(QuestionService);
  timer$!: Observable<number>;
  revealed$ = new BehaviorSubject(false);
  currentQuestionIndex$ = new BehaviorSubject(0);
  selected$ = new BehaviorSubject<number | null>(null);

  activeQuestion = toSignal(
    this.questionService.watchActiveQuestion(playerStore.getValue().roomId!),
  );

  get isRevealed(): boolean {
    return this.revealed$.value;
  }

  get currentQuestion(): Signal<Question | null | undefined> {
    return this.activeQuestion;
  }

  get progressPercent(): number {
    return (this.currentQuestionIndex$.value / 20) * 100;
  }

  ngOnInit() {
    // 1. Fetch the active roomId out of your Elf store
    const currentRoomId = playerStore.getValue().roomId;

    // Convert the real-time Firebase observable straight into a read-only Signal!
    this.timer$ = this.gameService.streamGameRoomTimer(currentRoomId!);
  }

  handleTimeRanOut() {
    // Lock inputs, auto-submit selected answer if any, wait for host next step
    console.log('Time is up for this question!');
  }

  onSelectOption(idx: number): void {
    if (this.selected$.value !== null) return;
    this.selected$.next(idx);
    this.revealed$.next(true);
  }
}
