import { Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { ButtonModule } from 'primeng/button';
import { QuestionView } from './components/question-view/question-view';
import { QuestionService } from '@services/quiz/question.service';
import { Question } from '@models/quiz/question.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameService } from '@services/quiz/game.service';
import { PlayerList } from './components/player-list/player-list';
import { Player } from '@models/quiz/player.model';
import { getPlayerStatusLabel } from '@utils/player-utils';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { getTopLeaderboardPlayers } from '@utils/leaderboard.utils';
import { from, Subject, takeUntil } from 'rxjs';
import { RoomService } from '@services/room/room.service';
import { QuizSessionStatus } from '@models/quiz/quiz-session.model';

@Component({
  selector: 'app-room-page',
  imports: [ButtonModule, QuestionView, PlayerList, Leaderboard],
  templateUrl: './room-page.html',
  styleUrl: './room-page.css',
})
export class RoomPage {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);
  private roomService = inject(RoomService);

  private roomId: string | null = null;
  private questionService = inject(QuestionService);

  questionTimer: Signal<number | undefined> = signal(0);
  currentQuestion: Signal<Question | null | undefined> = signal(null);
  players: Signal<Player[] | undefined> = signal([]);
  questionLength: Signal<number | undefined> = signal(0);
  quizSessionStatus: Signal<QuizSessionStatus | undefined> = signal(undefined);
  isProcessing = signal(false);
  private destroy$ = new Subject<void>();

  playersWithUIData = computed(() => {
    const currentPlayers = this.players() ?? [];
    return currentPlayers.map((player) => ({
      ...player,
      statusText: getPlayerStatusLabel(player.status!),
    }));
  });

  leaderboardPlayers = computed(() => getTopLeaderboardPlayers(this.players() || []));

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.roomId = params.get('roomId');
    });
    this.currentQuestion = toSignal(this.questionService.watchActiveQuestion(this.roomId!));
    this.questionTimer = toSignal(this.gameService.streamGameRoomTimer(this.roomId!));
    this.players = toSignal(this.gameService.getPlayersInRoom(this.roomId!));
    this.questionLength = toSignal(from(this.questionService.getQuestionsLength(this.roomId!)), {
      initialValue: 0,
    });
    this.quizSessionStatus = toSignal(this.gameService.watchQuizSessionStatus(this.roomId!));

    effect(() => {
      const timer = this.questionTimer();
      const currentQuestionNumber = this.currentQuestion()?.questionNumber;
      const questionLength = this.questionLength();

      if (timer === undefined || currentQuestionNumber === undefined) {
        return;
      }

      // 3. Evaluate your business rules
      const isTimeUp = timer === 0;
      const isLastQuestion = currentQuestionNumber === questionLength;

      // if (isTimeUp && isLastQuestion) {
      //   // Untrack side-effects if you want to ensure the effect doesn't get stuck
      //   // calling this multiple times rapidly if other signals keep changing.
      //   this.adminService.endQuizSession(this.roomId!);
      // }
    });
  }

  startQuiz() {
    this.adminService.startQuizSession(this.roomId);
  }

  restartQuiz() {
    this.adminService.restartQuizSession(this.roomId);
  }

  endQuiz() {
    this.adminService.endQuizSession(this.roomId);
  }

  purgePlayers() {
    this.adminService.purgePlayers(this.roomId);
  }

  nextQuestion() {
    if (this.isProcessing()) return;

    this.isProcessing.set(true);

    this.adminService
      .nextQuestion(this.roomId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('Successfully moved to next question:', result.data);
          this.isProcessing.set(false);
        },
        error: (error) => {
          console.error('Failed to advance quiz:', error);
          this.isProcessing.set(false);
          // Handle error UI notification here (e.g., Toast notification)
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
