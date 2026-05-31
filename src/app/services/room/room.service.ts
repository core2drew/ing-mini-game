import { inject, Injectable } from '@angular/core';
import { doc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { QuizSessionStatus } from '@models/quiz/quiz-session.model';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private fireStore = inject(Firestore);

  async joinRoom(roomCode: string): Promise<boolean> {
    const roomRef = doc(this.fireStore, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    // 1. If the room doesn't even exist, fail immediately
    if (!roomSnap.exists()) {
      return false;
    }
    const roomData = roomSnap.data();

    if (roomData) {
      if (roomData['quizSession']['status'] === QuizSessionStatus.STARTED) {
        throw new Error(`Room ${roomCode} has already started.`);
      }
      if (roomData['quizSession']['status'] === QuizSessionStatus.ENDED) {
        throw new Error(`Room ${roomCode} has already ended.`);
      }
    }
    return true;
  }

  async checkIsRoomStarted(roomId: string | null): Promise<boolean> {
    const roomRef = doc(this.fireStore, `rooms/${roomId}`);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      return false;
    }

    const roomData = roomSnap.data();

    // Returns true if the status is anything other than 'LOBBY'
    return roomData['quizSession']['status'] === QuizSessionStatus.STARTED;
  }
}
