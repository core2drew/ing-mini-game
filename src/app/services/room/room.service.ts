import { inject, Injectable } from '@angular/core';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { filter, iif, Observable, of, switchMap, take } from 'rxjs';
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

  waitUntilGameEnds(
    roomId: string,
    options: { once?: boolean } = { once: true },
  ): Observable<boolean> {
    const roomDocRef = doc(this.fireStore, 'rooms', roomId);

    return new Observable<boolean>((observer) => {
      console.log(`📡 Opening real-time listener for Game to end: ${roomId}`);

      const unsubscribe = onSnapshot(
        roomDocRef,
        (snapshot) => {
          const data = snapshot.data();
          const isEnded = data ? data['quizSession']['status'] === QuizSessionStatus.ENDED : false;

          if (isEnded) {
            console.log(`🔄 Game ended`);
          }

          observer.next(isEnded);
        },
        (error) => observer.error(error),
      );

      return () => {
        console.log(`🔌 Closing listener for Game to end: ${roomId}`);
        unsubscribe();
      };
    }).pipe(
      switchMap((isStarted) =>
        iif(
          () => !!options.once,
          of(isStarted).pipe(take(1)), // If once is true, take 1 and complete
          of(isStarted), // If once is false, keep passing values through
        ),
      ),
    );
  }

  waitUntilGameStarts(
    roomId: string,
    options: { once?: boolean } = { once: true },
  ): Observable<boolean> {
    const roomDocRef = doc(this.fireStore, 'rooms', roomId);

    const gameStream$ = new Observable<boolean>((observer) => {
      console.log(`📡 Opening real-time listener for Game to start: ${roomId}`);

      const unsubscribe = onSnapshot(
        roomDocRef,
        (snapshot) => {
          const data = snapshot.data();
          const isStarted = data
            ? data['quizSession']['status'] === QuizSessionStatus.STARTED
            : false;

          if (isStarted) {
            console.log(`🔄 Game started event received`);
          }

          observer.next(isStarted);
        },
        (error) => observer.error(error),
      );

      return () => {
        console.log(`🔌 Closing listener for Game to start: ${roomId}`);
        unsubscribe();
      };
    });

    // Handle the conditional "once" logic elegantly using RxJS operators
    if (options.once) {
      return gameStream$.pipe(
        filter((isStarted) => isStarted === true), // 👈 Ignore 'false'. Only let 'true' pass.
        take(1), // 👈 Complete the stream as soon as 'true' happens.
      );
    }

    return gameStream$;
  }
}
