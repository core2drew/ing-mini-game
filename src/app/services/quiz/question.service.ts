import { inject, Injectable } from '@angular/core';
import { Question } from '@models/quiz/question.model';
import { Firestore } from '@angular/fire/firestore';
import { collection, doc, getCountFromServer, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private fireStore = inject(Firestore);

  watchActiveQuestion(roomId: string): Observable<Question> {
    if (!roomId) {
      throw new Error('roomId is required');
    }
    return new Observable<Question>((subscriber) => {
      const roomRef = doc(this.fireStore, `rooms/${roomId}`);
      let unsubscribeQuestion: (() => void) | null = null;
      let lastQuestionIndex: number | null | undefined = undefined;

      const unsubscribeRoom = onSnapshot(
        roomRef,
        (roomSnap) => {
          if (!roomSnap.exists()) {
            subscriber.error(new Error('Room not found'));
            return;
          }

          const roomData = roomSnap.data();
          const currentQuestionIndex = roomData?.['quizSession']?.['currentQuestionIndex'];

          // Only tear down and rebuild listeners if the index shifted
          if (lastQuestionIndex !== currentQuestionIndex) {
            lastQuestionIndex = currentQuestionIndex; // Update tracked index

            if (unsubscribeQuestion) {
              unsubscribeQuestion();
            }

            const questionRef = doc(
              this.fireStore,
              `rooms/${roomId}/questions/${currentQuestionIndex}`,
            );

            unsubscribeQuestion = onSnapshot(
              questionRef,
              (questionSnap) => {
                if (!questionSnap.exists()) {
                  subscriber.error(new Error('Question missing'));
                  return;
                }

                subscriber.next({
                  ...(questionSnap.data() as Question),
                  questionNumber: currentQuestionIndex + 1,
                });
              },
              (error) => subscriber.error(error),
            );
          }
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
