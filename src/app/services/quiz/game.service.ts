import { inject, Injectable } from '@angular/core';
import { QuestionService } from './question.service';
import { interval, map, Observable, of, startWith, switchMap, take } from 'rxjs';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private fireStore = inject(Firestore);

  // calculateScore(answers: number[]): number {
  //   const questions = this.questionService.getQuestions();
  //   let score = 0;

  //   answers.forEach((answer, index) => {
  //     if (answer === questions[index].correctIndex) {
  //       score++;
  //     }
  //   });

  //   return score;
  // }

  // isAnswerCorrect(questionIndex: number, answerIndex: number): boolean {
  //   const questions = this.questionService.getQuestions();
  //   return answerIndex === questions[questionIndex].correctIndex;
  // }

  // isLastQuestion(currentIndex: number): boolean {
  //   return currentIndex === this.questionService.getQuestionCount() - 1;
  // }

  /**
   * Listens to the room's deadline and outputs the remaining seconds in real-time.
   */
  streamGameRoomTimer(roomCode: string): Observable<number> {
    const roomRef = doc(this.fireStore, 'rooms', roomCode);

    // 1. Establish a real-time stream of the Room document
    const roomStream$ = new Observable<Timestamp | null>((observer) => {
      const unsubscribe = onSnapshot(
        roomRef,
        (snapshot) => {
          const data = snapshot.data();
          observer.next(data!['quizSession']!['questionTimerExpiresAt'] || null);
        },
        (err) => observer.error(err),
      );
      return () => unsubscribe();
    });

    // 2. Map the deadline into a live ticking countdown
    return roomStream$.pipe(
      switchMap((expiryTimestamp) => {
        console.log(expiryTimestamp);
        if (!expiryTimestamp) {
          return of(0); // No active timer
        }

        // Convert Firestore Timestamp to JavaScript Date milliseconds
        const deadline = expiryTimestamp.toMillis();

        // Create an interval that ticks every 1 second (1000ms)
        return interval(1000).pipe(
          startWith(0), // Tick immediately on discovery
          map(() => {
            const now = Date.now();
            const distance = deadline - now;
            const secondsLeft = Math.floor(distance / 1000);

            // Return 0 if the time has completely run out
            return secondsLeft > 0 ? secondsLeft : 0;
          }),
        );
      }),
    );
  }
}
