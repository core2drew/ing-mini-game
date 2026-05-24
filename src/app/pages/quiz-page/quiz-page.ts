import { Component, inject, signal, Signal } from '@angular/core';
import { QuestionText } from './components/question-text/question-text';
import { QuestionOptionButton } from './components/question-option-button/question-option-button';
import { QuizProgress } from './components/quiz-progress/quiz-progress';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Question } from '@models/quiz/question.model';
import { QuestionService } from '@services/quiz/question.service';
import { playerStore } from '@stores/player.store';
import { GameService } from '@services/quiz/game.service';
import { QuizTimer } from './components/quiz-timer/quiz-timer';
import { Router } from '@angular/router';
import { RoomService } from '@services/room/room.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { QuestionScreen } from './components/screens/question-screen/question-screen';
import { WrongAnswerScreen } from './components/screens/wrong-answer-screen/wrong-answer-screen';
import { CorrectAnswerScreen } from './components/screens/correct-answer-screen/correct-answer-screen';
@Component({
  selector: 'app-quiz-page',
  imports: [CommonModule, QuestionScreen, WrongAnswerScreen, CorrectAnswerScreen],
  templateUrl: './quiz-page.html',
  styleUrl: './quiz-page.css',
  standalone: true,
})
export class QuizPage {
  playerId: string = '';
  secondsLeft = 0;

  currentQuestion$ = new BehaviorSubject(0);
  revealed$ = new BehaviorSubject(false);
  selected$ = new BehaviorSubject<number | null>(null);
  answers$ = new BehaviorSubject<number[]>([]);

  finished$ = new BehaviorSubject(false);
  timer$!: Observable<number>;

  private gameEndSub!: Subscription;

  private router = inject(Router);
  private gameService = inject(GameService);
  private roomService = inject(RoomService);

  wrongScreenActive = signal(false);
  correctScreenActive = signal(false);

  ngOnInit(): void {
    // 1. Fetch the active roomId out of your Elf store
    const currentRoomId = playerStore.getValue().roomId;

    if (!currentRoomId) {
      console.error('No active room found, redirecting back to home.');
      this.router.navigate(['/']);
      return;
    }

    // Convert the real-time Firebase observable straight into a read-only Signal!
    this.timer$ = this.gameService.streamGameRoomTimer(currentRoomId!);

    // 2. Start watching for the host to click "End Game"
    this.gameEndSub = this.roomService.waitUntilGameEnds(currentRoomId).subscribe({
      next: (isEnded) => {
        if (isEnded) {
          console.log('Game has ended! Redirecting to arena...');
          // 3. Move the player out of the lobby into the active match
          this.router.navigate(['/join']);
        }
      },
      error: (err) => console.error('Error listening to room status:', err),
    });
  }

  ngOnDestroy(): void {
    if (this.gameEndSub) {
      this.gameEndSub.unsubscribe();
    }
  }
}
