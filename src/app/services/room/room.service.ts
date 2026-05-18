import { inject, Injectable } from '@angular/core';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
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

    // 3. Room exists and hasn't started yet, allow entry
    return true;
  }

  waitUntilGameStarts(roomId: string): Observable<boolean> {
    const roomDocRef = doc(this.fireStore, 'rooms', roomId);

    return new Observable<boolean>((observer) => {
      console.log(`📡 Opening real-time listener for Room: ${roomId}`);

      const unsubscribe = onSnapshot(
        roomDocRef,
        (snapshot) => {
          const data = snapshot.data();
          const isStarted = data ? !!data['isStarted'] : false;

          // Debug log to see exactly when and what Firestore emits
          console.log(`🔄 Room updated. isStarted status is currently: ${isStarted}`);

          observer.next(isStarted);
        },
        (error) => observer.error(error),
      );

      return () => {
        console.log(`🔌 Closing listener for Room: ${roomId}`);
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
