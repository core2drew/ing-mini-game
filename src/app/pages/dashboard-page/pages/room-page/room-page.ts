import { Component, computed, inject, signal, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { ButtonModule } from 'primeng/button';
import { QuestionView } from './components/question-view/question-view';
import { QuestionService } from '@services/quiz/question.service';
import { Question } from '@models/quiz/question.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameService } from '@services/quiz/game.service';
import { PlayerList } from './components/player-list/player-list';
import { Player, PlayerStatus } from '@models/quiz/player.model';
import { getAvatarColorByName, getPlayerStatusLabel } from '@utils/player-utils';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { getTopLeaderboardPlayers } from '@utils/leaderboard.utils';
import { from } from 'rxjs';

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

  private roomId: string | null = null;
  private questionService = inject(QuestionService);

  questionTimer: Signal<number | undefined> = signal(0);
  currentQuestion: Signal<Question | undefined> = signal(undefined);
  players: Signal<Player[] | undefined> = signal([]);
  questionLength: Signal<number | undefined> = signal(0);

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
    this.questionLength = toSignal(from(this.questionService.getQuestionsLength(this.roomId!)));
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

  nextQuestion() {
    this.adminService.nextQuestion(this.roomId);
  }
}
