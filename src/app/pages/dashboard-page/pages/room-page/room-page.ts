import { Component, inject, signal, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { ButtonModule } from 'primeng/button';
import { QuestionView } from './components/question-view/question-view';
import { QuestionService } from '@services/quiz/question.service';
import { Question } from '@models/quiz/question.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameService } from '@services/quiz/game.service';
import { PlayerList } from './components/player-list/player-list';

@Component({
  selector: 'app-room-page',
  imports: [ButtonModule, QuestionView, PlayerList],
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

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.roomId = params.get('roomId');
    });
    this.currentQuestion = toSignal(this.questionService.watchActiveQuestion(this.roomId!));
    this.questionTimer = toSignal(this.gameService.streamGameRoomTimer(this.roomId!));
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
