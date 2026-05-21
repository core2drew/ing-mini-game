import { inject, Injectable } from '@angular/core';
import { Question } from '@models/quiz/question.model';
import {
  collectionData,
  query,
  collection as firestoreCollection,
  Firestore,
} from '@angular/fire/firestore';
import { collection, doc, getCountFromServer, getDoc } from 'firebase/firestore';

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

  async getActiveQuestion(roomId: string): Promise<Question | null> {
    // Reference the room document using the injected instance
    const roomRef = doc(this.fireStore, `rooms/${roomId}`);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) throw new Error('Room not found');

    const roomData = roomSnap.data();
    const currentQuestionId = roomData['quizSession']?.['currentQuestionId'];

    if (currentQuestionId === undefined) return null;

    // Fetch the specific question from the subcollection
    const questionRef = doc(this.fireStore, `rooms/${roomId}/questions/${currentQuestionId}`);
    const questionSnap = await getDoc(questionRef);
    console.log(questionSnap);
    if (!questionSnap.exists()) throw new Error('Question missing');

    return { ...(questionSnap.data() as Question) };
  }

  async getQuestionsLength(roomId: string): Promise<number> {
    const questionsCollection = collection(this.fireStore, `rooms/${roomId}/questions`);
    const snapshot = await getCountFromServer(questionsCollection);

    return snapshot.data().count;
  }
}
