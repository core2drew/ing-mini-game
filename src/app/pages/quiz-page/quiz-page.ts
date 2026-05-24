import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { playerStore } from '@stores/player.store';
import { Router } from '@angular/router';
import { RoomService } from '@services/room/room.service';
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

  private gameEndSub!: Subscription;

  private router = inject(Router);
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
