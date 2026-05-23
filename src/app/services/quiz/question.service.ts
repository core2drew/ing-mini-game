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

  private questions: Question[] = [
    {
      text: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctIndex: 2,
    },
    {
      text: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctIndex: 1,
    },
    {
      text: 'How many sides does a hexagon have?',
      options: ['5', '6', '7', '8'],
      correctIndex: 1,
    },
    {
      text: 'Which element has the chemical symbol "O"?',
      options: ['Gold', 'Oxygen', 'Osmium', 'Oganesson'],
      correctIndex: 1,
    },
  ];

  watchActiveQuestion(roomId: string): Observable<Question | null> {
    return new Observable<Question | null>((subscriber) => {
      const roomRef = doc(this.fireStore, `rooms/${roomId}`);

      // Variable to keep track of our active question listener so we can clean it up
      let unsubscribeQuestion: (() => void) | null = null;

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

          // If there is no active index, emit null
          if (currentQuestionIndex === undefined || currentQuestionIndex === null) {
            subscriber.next(null);
            return;
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
              subscriber.next({ ...(questionSnap.data() as Question) });
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
