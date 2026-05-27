import { effect, inject, Injectable, signal } from '@angular/core';
import { Question } from '@models/quiz/question.model';
import { Firestore } from '@angular/fire/firestore';
import { collection, doc, getCountFromServer, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { GameService } from './game.service';
import { PlayerStatus } from '@models/quiz/player.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private fireStore = inject(Firestore);
  private gameService = inject(GameService);
  wrongAnswer = signal(false);
  correctAnswer = signal(false);

  watchActiveQuestion(roomId: string): Observable<Question> {
    if (!roomId) {
      throw new Error('roomId is required');
    }
    return new Observable<Question>((subscriber) => {
      const roomRef = doc(this.fireStore, `rooms/${roomId}`);

      // Variable to keep track of our active question listener so we can clean it up
      let unsubscribeQuestion: (() => void) | null = null;

      // Track the last known index to check for true changes
      let lastQuestionIndex: number | null | undefined = undefined;

      // 1. Listen to the room document for changes to 'currentQuestionIndex'
      const unsubscribeRoom = onSnapshot(
        roomRef,
        (roomSnap) => {
          if (!roomSnap.exists()) {
            subscriber.error(new Error('Room not found'));
            return;
          }

          const roomData = roomSnap.data();
          const currentQuestionIndex = roomData?.['quizSession']?.['currentQuestionIndex'];

          // 1. ONLY RESET IF THE INDEX ACTUALLY MOVED TO A NEW QUESTION
          if (lastQuestionIndex !== currentQuestionIndex) {
            this.wrongAnswer.set(false);
            this.correctAnswer.set(false);
            lastQuestionIndex = currentQuestionIndex; // Update tracked index
          }

          // 2. Tear down the PREVIOUS question listener if the index changed
          if (unsubscribeQuestion) {
            unsubscribeQuestion();
          }

          // 3. Set up a new listener for the freshly updated question document
          const questionRef = doc(
            this.fireStore,
            `rooms/${roomId}/questions/${currentQuestionIndex}`,
          );

          unsubscribeQuestion = onSnapshot(
            questionRef,
            (questionSnap) => {
              console.log(questionSnap.data());

              if (!questionSnap.exists()) {
                subscriber.error(new Error('Question missing'));
                return;
              }

              // Emit the real-time question data down the stream
              this.gameService.setPlayerStatus(PlayerStatus.THINKING);
              subscriber.next({
                ...(questionSnap.data() as Question),
                questionNumber: currentQuestionIndex + 1,
              });
            },
            (error) => subscriber.error(error),
          );
        },
        (error) => subscriber.error(error),
      );

      // 4. IMPORTANT: Clean up ALL active listeners when the consumer unsubscribes
      return () => {
        unsubscribeRoom();
        if (unsubscribeQuestion) {
          unsubscribeQuestion();
        }
      };
    });
  }

  async getQuestionsLength(roomId: string): Promise<number> {
    const questionsCollection = collection(this.fireStore, `rooms/${roomId}/questions`);
    const snapshot = await getCountFromServer(questionsCollection);

    return snapshot.data().count;
  }
}
