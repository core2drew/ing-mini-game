import { inject, Injectable } from '@angular/core';

import { interval, map, Observable, of, startWith, switchMap } from 'rxjs';
import { collection, doc, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { Player, PlayerStatus } from '@models/quiz/player.model';
import { httpsCallable } from 'firebase/functions';
import { Functions } from '@angular/fire/functions';
import { SessionService } from '@services/session/session.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private fireStore = inject(Firestore);
  private functions = inject(Functions);
  private sessionService = inject(SessionService);

  getPlayersInRoom(roomId: string): Observable<Player[]> {
    // Define the path to the subcollection
    const playersCollectionPath = `rooms/${roomId}/players`;

    // Create a reference to the collection
    const playersColRef = collection(this.fireStore, playersCollectionPath);

    const playersQuery = query(playersColRef, orderBy('joined_at', 'asc'));

    // Fetch the data as an observable.
    // Passing { idField: 'id' } automatically maps the Firestore document ID to a property named 'id'
    return collectionData(playersQuery, { idField: 'id' }) as Observable<Player[]>;
  }

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

  // Create a reusable caller instance
  private updateStatusCall = httpsCallable<
    { roomId: string; playerName: string; targetStatus: PlayerStatus },
    any
  >(this.functions, 'updatePlayerStatus');

  async setPlayerStatus(targetStatus: PlayerStatus) {
    // Read directly from the Elf signals synchronously
    const roomId = this.sessionService.roomId();
    const playerName = this.sessionService.playerName();

    if (!roomId || !playerName) throw new Error('No active game session found.');

    return this.updateStatusCall({
      roomId,
      playerName,
      targetStatus,
    });
  }
}
