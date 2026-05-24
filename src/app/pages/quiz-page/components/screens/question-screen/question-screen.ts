import { Component, computed, inject, model, signal, Signal } from '@angular/core';
import { QuizTimer } from '../../quiz-timer/quiz-timer';
import { QuizProgress } from '../../quiz-progress/quiz-progress';
import { QuestionText } from '../../question-text/question-text';
import { QuestionOptionButton } from '../../question-option-button/question-option-button';
import { playerStore } from '@stores/player.store';
import { GameService } from '@services/quiz/game.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question } from '@models/quiz/question.model';
import { QuestionService } from '@services/quiz/question.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

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
  timer$!: Observable<number>;
  revealed$ = new BehaviorSubject(false);
  currentQuestionIndex$ = new BehaviorSubject(0);
  readonly selected = signal<number | null>(null);

  activeQuestion = toSignal(
    this.questionService.watchActiveQuestion(playerStore.getValue().roomId!),
  );

  wrongScreenActive = model.required<boolean>();
  correctScreenActive = model.required<boolean>();

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

  ngOnInit() {
    const currentRoomId = playerStore.getValue().roomId;
    this.timer$ = this.gameService.streamGameRoomTimer(currentRoomId!);
  }

  timeRanOut() {
    // Lock inputs, auto-submit selected answer if any, wait for host next step
    console.log('Time is up for this question!');
    this.revealed$.next(true);
    setTimeout(() => {
      this.wrongScreenActive.set(true);
    }, 900);
  }

  onSelectOption(idx: number): void {
    if (this.selected() !== null) return;
    this.selected.set(idx);
    setTimeout(() => {
      if (this.selected() === this.activeQuestion()?.correctIndex) {
        this.correctScreenActive.set(true);
      } else {
        this.wrongScreenActive.set(true);
      }
    }, 900);
  }
}
