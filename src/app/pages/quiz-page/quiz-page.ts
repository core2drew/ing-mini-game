import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-quiz-page',
  imports: [QuestionText, QuestionOptionButton, QuizProgress, QuizTimer, CommonModule],
  templateUrl: './quiz-page.html',
  styleUrl: './quiz-page.css',
  standalone: true,
})
export class QuizPage {
  playerId: string = '';
  questions: Question[] = [];
  secondsLeft = 0;

  currentQuestion$ = new BehaviorSubject(0);
  revealed$ = new BehaviorSubject(false);
  selected$ = new BehaviorSubject<number | null>(null);
  answers$ = new BehaviorSubject<number[]>([]);
  score$ = new BehaviorSubject(0);
  finished$ = new BehaviorSubject(false);
  timer$!: Observable<number>;

  private timerSub!: Subscription;
  private gameEndSub!: Subscription;

  private router = inject(Router);
  private questionService = inject(QuestionService);
  private gameService = inject(GameService);
  private roomService = inject(RoomService);

  ngOnInit(): void {
    this.questions = this.questionService.getQuestions();

    const currentRoomCode = playerStore.getValue().roomId; // Grab room code from Elf store

    this.timer$ = this.gameService.streamGameRoomTimer(currentRoomCode!);

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

  handleTimeRanOut() {
    // Lock inputs, auto-submit selected answer if any, wait for host next step
    console.log('Time is up for this question!');
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  get progressPercent(): number {
    return (this.currentQuestion$.value / this.questions.length) * 100;
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestion$.value];
  }

  get isRevealed(): boolean {
    return this.revealed$.value;
  }

  onSelectOption(idx: number): void {
    if (this.selected$.value !== null) return;
    this.selected$.next(idx);
    this.revealed$.next(true);
  }
}
