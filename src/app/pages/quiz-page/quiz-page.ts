import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { playerStore } from '@stores/player.store';
import { Router } from '@angular/router';
import { RoomService } from '@services/room/room.service';
import { QuestionScreen } from './components/screens/question-screen/question-screen';
import { WrongAnswerScreen } from './components/screens/wrong-answer-screen/wrong-answer-screen';
import { CorrectAnswerScreen } from './components/screens/correct-answer-screen/correct-answer-screen';
import { QuestionService } from '@services/quiz/question.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameService } from '@services/quiz/game.service';
import { Question } from '@models/quiz/question.model';
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
  questionTimer: Signal<number | undefined> = signal(0);
  activeQuestion: Signal<Question | undefined> = signal(undefined);
  correctAnswer: Signal<string> = signal('');

  finished$ = new BehaviorSubject(false);

  private gameEndSub!: Subscription;

  private router = inject(Router);
  private roomService = inject(RoomService);
  private questionService = inject(QuestionService);
  private gameService = inject(GameService);
  private currentRoomId = playerStore.getValue().roomId;

  wrongScreenActive = this.questionService.wrongAnswer;
  correctScreenActive = this.questionService.correctAnswer;

  constructor() {
    if (!this.currentRoomId) {
      console.error('No active room found, redirecting back to home.');
      this.router.navigate(['/']);
      return;
    }
    this.activeQuestion = toSignal(
      this.questionService.watchActiveQuestion(playerStore.getValue().roomId!),
    );

    this.questionTimer = toSignal(this.gameService.streamGameRoomTimer(this.currentRoomId!));

    this.correctAnswer = computed(() => {
      const question = this.activeQuestion();
      // Safety check: if there's no question, or options/correctIndex are missing
      if (!question || !question.options || question.correctIndex === undefined) {
        return '';
      }
      return question.options[question.correctIndex];
    });

    this.gameEndSub = this.roomService.waitUntilGameEnds(this.currentRoomId).subscribe({
      next: (isEnded) => {
        if (isEnded) {
          console.log('Game has ended! Redirecting to arena...');
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
