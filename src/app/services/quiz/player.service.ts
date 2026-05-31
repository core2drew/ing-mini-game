import { Injectable, inject } from '@angular/core';

import { updateDoc, doc, runTransaction, docData, Timestamp } from '@angular/fire/firestore';
import { from, map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { Player, PlayerStatus } from '@models/quiz/player.model';
import { sessionStore } from '../../stores/session.store';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private fireStore = inject(Firestore);

  createPlayer(name: string): Observable<Player> {
    const cleanName = name.trim().toLowerCase();

    // 1. Stream the current state from your Elf store
    return sessionStore.pipe(
      // Select the roomId field from your store state
      map((state) => state.roomId),
      // Ensure we only take the current value and complete the store stream listener
      take(1),
      // Switch into the asynchronous Firestore operation
      switchMap((roomId) => {
        if (!roomId) {
          return throwError(() => new Error('No active Room ID found in store.'));
        }
        // 2. Target the unique subcollection path: rooms/{roomId}/players/{cleanName}
        const playerDocRef = doc(this.fireStore, 'rooms', roomId, 'players', cleanName);
        const playerData = {
          name: name.trim(), // Keep original casing for display
          score: 0,
          joined_at: Timestamp.now(),
          hasAnswered: false,
          status: PlayerStatus.WAITING,
          lastScoreUpdateTime: null,
        };

        // 3. Wrap the Firestore Transaction in an RxJS Observable using from()
        return from(
          runTransaction(this.fireStore, async (transaction) => {
            const playerSnapshot = await transaction.get(playerDocRef);

            // Transaction Checker: Block duplicates before writing
            if (playerSnapshot.exists()) {
              throw new Error('Player name is already taken.');
            }

            // Safe to write if it doesn't exist
            transaction.set(playerDocRef, playerData);
          }),
        ).pipe(
          // 4. If the transaction succeeds, map to your Player object payload
          map(() => {
            return {
              id: cleanName,
              ...playerData,
            } as Player;
          }),
        );
      }),
    );
  }

  /**
   * Fetches a single player's status from a specific room's subcollection.
   */
  getPlayer(roomId: string, playerName: string): Observable<Player | undefined> {
    // 1. Guard against missing IDs
    if (!roomId || !playerName) return of(undefined);

    // 2. Direct pathing to the subcollection document: rooms/{roomId}/players/{playerId}
    const cleanName = playerName.trim().toLowerCase();
    const playerDocRef = doc(this.fireStore, 'rooms', roomId, 'players', cleanName);
    // docData keeps the connection alive and emits whenever the doc changes
    return docData(playerDocRef) as Observable<Player>;
  }
}
