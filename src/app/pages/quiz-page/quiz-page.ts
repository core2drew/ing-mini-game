import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, from, of, switchMap } from 'rxjs';
import { sessionStore } from '@stores/session.store';
import { Router } from '@angular/router';
import { QuestionScreen } from './components/screens/question-screen/question-screen';
import { WrongAnswerScreen } from './components/screens/wrong-answer-screen/wrong-answer-screen';
import { CorrectAnswerScreen } from './components/screens/correct-answer-screen/correct-answer-screen';
import { QuestionService } from '@services/quiz/question.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { GameService } from '@services/quiz/game.service';
import { Question } from '@models/quiz/question.model';
import { SessionService } from '@services/session/session.service';
import { PlayerStatus } from '@models/quiz/player.model';
import { CompleteScreen } from './components/screens/complete-screen/complete-screen';
import { PlayerService } from '@services/quiz/player.service';
import { GameoverScreen } from './components/screens/gameover-screen/gameover-screen';
import { QuizSessionStatus } from '@models/quiz/quiz-session.model';
@Component({
  selector: 'app-quiz-page',
  imports: [
    CommonModule,
    QuestionScreen,
    WrongAnswerScreen,
    CorrectAnswerScreen,
    CompleteScreen,
    GameoverScreen,
  ],
  templateUrl: './quiz-page.html',
  styleUrl: './quiz-page.css',
  standalone: true,
})
export class QuizPage {
  private router = inject(Router);
  private questionService = inject(QuestionService);
  private gameService = inject(GameService);
  private sessionService = inject(SessionService);
  private playerService = inject(PlayerService);

  private currentRoomId = sessionStore.getValue().roomId;
  private roomId = this.sessionService.roomId();
  private playerName = this.sessionService.playerName();

  activeQuestion: Signal<Question | undefined | null> = signal(null);
  quizCompleted: Signal<boolean | undefined> = signal(undefined);

  readonly questionLength = toSignal(from(this.questionService.getQuestionsLength(this.roomId!)));
  readonly player = toSignal(this.playerService.getPlayer(this.roomId!, this.playerName!));
  readonly questionTimer = toSignal(this.gameService.streamGameRoomTimer(this.currentRoomId!));
  readonly quizSessionStatus = toSignal(this.gameService.watchQuizSessionStatus(this.roomId!));

  lastQuestionCorrectAnswer: string | undefined;
  lastQuestionPoints = signal<number>(0);
  lastQuestionBonusPoints = signal<number | undefined>(0);

  wrongScreenActive = signal(false);
  correctScreenActive = signal(false);
  completeScreenActive = signal(false);
  gameOverScreenActive = signal(false);

  // 1. Create a isolated computed property for the condition
  isPlayerOffline = computed(() => this.player()?.status === PlayerStatus.OFFLINE);

  // Add this inside your QuizPage class, right below your other signals
  isLoading = computed(() => {
    const player = this.player();
    const qLength = this.questionLength();
    const timer = this.questionTimer();
    const question = this.activeQuestion();

    // 1. Wait for initial player and quiz metadata to arrive from Firestore/Backend
    if (player === undefined || qLength === undefined) {
      return true;
    }
    // 2. If the player is actively taking the quiz, ensure the question has loaded
    // (Prevents the question screen from flashing blank before the question data arrives)
    if (player.status === PlayerStatus.THINKING && !question) {
      if (!question || timer === undefined) {
        return true;
      }
    }

    // Data is loaded, safe to render the screens
    return false;
  });

  constructor() {
    if (!this.currentRoomId) {
      console.error('No active room found, redirecting back to home.');
      this.router.navigate(['/']);
      return;
    }
    this.activeQuestion = toSignal(
      combineLatest([
        toObservable(this.wrongScreenActive),
        toObservable(this.completeScreenActive),
        toObservable(this.gameOverScreenActive),
        toObservable(this.isPlayerOffline),
      ]).pipe(
        switchMap(([isWrongActive, isCompleteScreenActive, isGameOverScreenActive, isOffline]) => {
          const isAnyScreenLocked =
            isWrongActive || isCompleteScreenActive || isGameOverScreenActive || isOffline;

          if (isAnyScreenLocked) {
            console.log('🔒 Screen is locked by an overlay. Pausing active question sync.');
            // Tear down the active snapshot connection and emit an undefined state holder
            return of(null);
          }

          // No screens are blocking, safely watch the live question feed
          return this.questionService.watchActiveQuestion(this.currentRoomId!);
        }),
      ),
    );

    effect(async () => {
      const question = this.activeQuestion();
      const player = this.player();
      const quizSessionStatus = this.quizSessionStatus();

      if (question) {
        this.lastQuestionCorrectAnswer = question?.options[question?.correctIndex];
        this.lastQuestionPoints.set(question.points);
      }

      if (!player) {
        return;
      }

      switch (player.status) {
        case PlayerStatus.THINKING:
          this.correctScreenActive.set(false);
          break;

        case PlayerStatus.CORRECT:
          if (quizSessionStatus === QuizSessionStatus.STARTED) {
            this.lastQuestionBonusPoints.set(player.lastQuestionBonusPoints);
            this.correctScreenActive.set(true);
          } else if (quizSessionStatus === QuizSessionStatus.ENDED) {
            this.completeScreenActive.set(true);
          }
          break;

        case PlayerStatus.WRONG:
          if (quizSessionStatus === QuizSessionStatus.STARTED) {
            this.wrongScreenActive.set(true);
          } else if (quizSessionStatus === QuizSessionStatus.ENDED) {
            this.gameOverScreenActive.set(true);
          }
          break;

        case PlayerStatus.COMPLETED:
          this.completeScreenActive.set(true);
          break;
        case PlayerStatus.OFFLINE:
          this.gameOverScreenActive.set(true);
          break;
      }
    });
  }
}
