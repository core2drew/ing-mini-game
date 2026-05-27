import { inject, Injectable } from '@angular/core';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { filter, Observable, take } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';

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

    // 2. Condition: If the game has already started, block the player from joining
    if (roomData && roomData['isStarted'] === true) {
      throw new Error(`Room ${roomCode} has already started.`);
    }

    if (roomData && roomData['isEnded'] === true) {
      throw new Error(`Room ${roomCode} has already ended.`);
    }

    // 3. Room exists and hasn't started yet, allow entry
    return true;
  }

  async checkIsRoomStarted(roomId: string | null): Promise<boolean> {
    const roomRef = doc(this.fireStore, `rooms/${roomId}`);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('Room does not exist.');
    }

    const roomData = roomSnap.data();

    // Returns true if the status is anything other than 'LOBBY'
    return roomData['isStarted'] === true;
  }

  waitUntilGameEnds(roomId: string): Observable<boolean> {
    const roomDocRef = doc(this.fireStore, 'rooms', roomId);

    return new Observable<boolean>((observer) => {
      console.log(`📡 Opening real-time listener for Game to end: ${roomId}`);

      const unsubscribe = onSnapshot(
        roomDocRef,
        (snapshot) => {
          const data = snapshot.data();
          const isEnded = data ? !!data['isEnded'] : false;

          // Debug log to see exactly when and what Firestore emits
          console.log(`🔄 Game updated. isEnded status is currently: ${isEnded}`);

          observer.next(isEnded);
        },
        (error) => observer.error(error),
      );

      return () => {
        console.log(`🔌 Closing listener for Game to end: ${roomId}`);
        unsubscribe();
      };
    }).pipe(
      // 1. Only let the stream pass if it hits our target condition
      filter((isEnded) => isEnded === true),
      // 2. Shut down the pipeline only AFTER the true value escapes
      take(1),
    );
  }

  waitUntilGameStarts(roomId: string): Observable<boolean> {
    const roomDocRef = doc(this.fireStore, 'rooms', roomId);

    return new Observable<boolean>((observer) => {
      console.log(`📡 Opening real-time listener for Game to start: ${roomId}`);

      const unsubscribe = onSnapshot(
        roomDocRef,
        (snapshot) => {
          const data = snapshot.data();
          const isStarted = data ? !!data['isStarted'] : false;

          // Debug log to see exactly when and what Firestore emits
          console.log(`🔄 Game updated. isStarted status is currently: ${isStarted}`);

          observer.next(isStarted);
        },
        (error) => observer.error(error),
      );

      return () => {
        console.log(`🔌 Closing listener for Game to start: ${roomId}`);
        unsubscribe();
      };
    }).pipe(
      // 1. Only let the stream pass if it hits our target condition
      filter((isStarted) => isStarted === true),
      // 2. Shut down the pipeline only AFTER the true value escapes
      take(1),
    );
  }
}
