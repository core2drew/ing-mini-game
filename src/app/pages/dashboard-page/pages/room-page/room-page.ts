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

  playersWithUIData = computed(() => {
    const currentPlayers = this.players() ?? [];
    return currentPlayers.map((player) => ({
      ...player,
      avatarColor: getAvatarColorByName(player.name), // Calculate color once per player change
      statusText: getPlayerStatusLabel(player.status!),
    }));
  });

  leaderboardPlayers = computed(() => {
    const sortedPool = this.playersWithUIData().sort((playerA, playerB) => {
      // Axis 1: Score
      if (playerB.score !== playerA.score) {
        return playerB.score - playerA.score;
      }

      // Axis 2: Timestamp Speed
      const timeA = playerA.lastScoreUpdateTime?.toMillis() ?? null;
      const timeB = playerB.lastScoreUpdateTime?.toMillis() ?? null;

      if (timeA !== null || timeB !== null) {
        if (timeA === null) return 1;
        if (timeB === null) return -1;
        if (timeA !== timeB) return timeA - timeB;
      }

      // Axis 3: 🔥 Alphabetical Fallback (When scores match and both times are null/identical)
      return playerA.name.localeCompare(playerB.name);
    });

    return sortedPool.splice(0, 10);
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.roomId = params.get('roomId');
    });
    this.currentQuestion = toSignal(this.questionService.watchActiveQuestion(this.roomId!));
    this.questionTimer = toSignal(this.gameService.streamGameRoomTimer(this.roomId!));
    this.players = toSignal(this.gameService.getPlayersInRoom(this.roomId!));
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
