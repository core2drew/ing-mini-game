import { Component, effect, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, from, of, Subscription, switchMap } from 'rxjs';
import { sessionStore } from '@stores/session.store';
import { Router } from '@angular/router';
import { RoomService } from '@services/room/room.service';
import { QuestionScreen } from './components/screens/question-screen/question-screen';
import { WrongAnswerScreen } from './components/screens/wrong-answer-screen/wrong-answer-screen';
import { CorrectAnswerScreen } from './components/screens/correct-answer-screen/correct-answer-screen';
import { QuestionService } from '@services/quiz/question.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { GameService } from '@services/quiz/game.service';
import { Question } from '@models/quiz/question.model';
import { SessionService } from '@services/session/session.service';
import { PlayerStatus } from '@models/quiz/player.model';
import { EndScreen } from './components/screens/end-screen/end-screen';
@Component({
  selector: 'app-quiz-page',
  imports: [CommonModule, QuestionScreen, WrongAnswerScreen, CorrectAnswerScreen, EndScreen],
  templateUrl: './quiz-page.html',
  styleUrl: './quiz-page.css',
  standalone: true,
})
export class QuizPage {
  private router = inject(Router);
  private roomService = inject(RoomService);
  private questionService = inject(QuestionService);
  private gameService = inject(GameService);
  private sessionService = inject(SessionService);

  private gameEndSub!: Subscription;
  private quizEndSub!: Subscription;
  private currentRoomId = sessionStore.getValue().roomId;

  playerId: string = '';
  secondsLeft = 0;
  questionTimer: Signal<number | undefined> = signal(0);
  activeQuestion: Signal<Question | undefined> = signal(undefined);
  quizCompleted: Signal<boolean | undefined> = signal(undefined);

  readonly questionLength = toSignal(
    from(this.questionService.getQuestionsLength(this.sessionService.roomId()!)),
  );

  lastQuestionCorrectAnswer: string | undefined;
  lastQuestionScore: number = 0;

  wrongScreenActive = signal(false);
  correctScreenActive = signal(false);
  endScreenActive = signal(false);

  constructor() {
    if (!this.currentRoomId) {
      console.error('No active room found, redirecting back to home.');
      this.router.navigate(['/']);
      return;
    }
    this.activeQuestion = toSignal(
      combineLatest([
        toObservable(this.wrongScreenActive),
        toObservable(this.endScreenActive),
      ]).pipe(
        switchMap(([isWrongActive, isEndScreenActive]) => {
          const isAnyScreenLocked = isWrongActive || isEndScreenActive;

          if (isAnyScreenLocked) {
            console.log('🔒 Screen is locked by an overlay. Pausing active question sync.');
            // Tear down the active snapshot connection and emit an undefined state holder
            return of(undefined);
          }

          // No screens are blocking, safely watch the live question feed
          return this.questionService.watchActiveQuestion(this.currentRoomId!);
        }),
      ),
    );

    this.questionTimer = toSignal(this.gameService.streamGameRoomTimer(this.currentRoomId!));

    this.quizCompleted = toSignal(
      toObservable(this.wrongScreenActive).pipe(
        switchMap((isScreenLocked) => {
          if (isScreenLocked) {
            // Tear down the active snapshot connection and emit a null state holder
            return of(false);
          }
          return this.roomService.waitUntilQuizEndedResults(this.currentRoomId!);
        }),
      ),
    );

    effect(async () => {
      const question = this.activeQuestion();
      const quizCompleted = this.quizCompleted();

      if (question) {
        this.lastQuestionCorrectAnswer = question?.options[question?.correctIndex];
        this.lastQuestionScore = question.score;

        // 1. A new question has landed! Clear the previous screen UI states immediately
        this.correctScreenActive.set(false);

        // 2. Set the player status to THINKING on the backend via your Cloud Function
        if (this.sessionService.playerName() && !quizCompleted) {
          try {
            await this.gameService.setPlayerStatus(PlayerStatus.THINKING);
          } catch (error) {
            console.error('Failed to sync player status on new question:', error);
          }
        }
      }
      if (quizCompleted) {
        this.endScreenActive.set(true);
      }
    });
  }

  handleWrongAnswer() {
    this.gameService.setPlayerStatus(PlayerStatus.OFFLINE);
    this.gameService.updatePlayerScore();
    this.wrongScreenActive.set(true);
    this.correctScreenActive.set(false);
  }

  handleCorrectAnswer() {
    this.gameService.setPlayerStatus(PlayerStatus.WAITING);
    this.gameService.updatePlayerScore();
    // 2. Extract current values from your signals
    const totalQuestions = this.questionLength();
    const currentQuestionNumber = this.activeQuestion()?.questionNumber;

    if (totalQuestions !== currentQuestionNumber) {
      this.correctScreenActive.set(true);
    }

    this.wrongScreenActive.set(false);
  }

  ngOnDestroy(): void {
    if (this.gameEndSub) {
      this.gameEndSub.unsubscribe();
    }
    if (this.quizEndSub) {
      this.quizEndSub.unsubscribe();
    }
  }
}
