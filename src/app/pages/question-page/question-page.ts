import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from '@services/quiz/question.service';
import { BehaviorSubject, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
import { QuestionOptionButton } from '../../components/question-option-button/question-option-button';
import { CommonModule } from '@angular/common';
import { QuizTimer } from '../quiz-page/components/quiz-timer/quiz-timer';
import { GameService } from '@services/quiz/game.service';
import { QuizSessionStatus } from '@models/quiz/quiz-session.model';

@Component({
  selector: 'app-question-page',
  imports: [QuestionOptionButton, QuizTimer, CommonModule],
  templateUrl: './question-page.html',
  styleUrl: './question-page.css',
})
export class QuestionPage {
  private route = inject(ActivatedRoute);
  private questionService = inject(QuestionService);
  private gameService = inject(GameService);

  private readonly roomId$ = this.route.paramMap.pipe(
    map((params) => params.get('roomId')),
    filter((roomId): roomId is string => !!roomId),
    distinctUntilChanged(),
  );

  loading = signal(true);

  activeQuestion = toSignal(
    this.roomId$.pipe(
      tap(() => this.loading.set(true)),
      switchMap((roomId) => this.questionService.watchActiveQuestion(roomId)),
      tap({
        next: () => {
          this.loading.set(false)
          this.revealed$.next(false);
        },
        error: () => this.loading.set(false),
      }),
    ),
    { initialValue: null },
  );

  quizSessionStatus = toSignal(
    this.roomId$.pipe(
      tap(() => this.loading.set(true)),
      switchMap((roomId) => this.gameService.watchQuizSessionStatus(roomId)),
      tap({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      }),
    ),
    { initialValue: null },
  );

  readonly questionTimer = toSignal(
    this.roomId$.pipe(switchMap((roomId) => this.gameService.streamGameRoomTimer(roomId))),
    { initialValue: 0 },
  );

  revealed$ = new BehaviorSubject(false);

  isQuizStarted = computed(() => this.quizSessionStatus() === QuizSessionStatus.STARTED);
  isQuizWaiting = computed(() => this.quizSessionStatus() === QuizSessionStatus.WAITING);



  constructor() {
    effect(() => {
    const questionTimer = this.questionTimer();
      if (questionTimer === undefined) return;

      if(questionTimer === 0) {
        this.revealed$.next(true);
      } else {
        this.revealed$.next(false);
      }
    })
  }
}
