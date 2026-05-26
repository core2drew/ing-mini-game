import { Injectable, inject } from '@angular/core';

import {
  collection,
  orderBy,
  updateDoc,
  doc,
  onSnapshot,
  QuerySnapshot,
  runTransaction,
} from '@angular/fire/firestore';
import { from, map, Observable, switchMap, take, throwError } from 'rxjs';
import {
  collectionData,
  query,
  collection as firestoreCollection,
  Firestore,
} from '@angular/fire/firestore';
import { Player } from '@models/quiz/player.model';
import { playerStore } from '../../stores/player.store';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private fireStore = inject(Firestore);

  createPlayer(name: string): Observable<Player> {
    const cleanName = name.trim().toLowerCase();

    // 1. Stream the current state from your Elf store
    return playerStore.pipe(
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
          joined_at: new Date(),
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

  getPlayer(id: string): Observable<Player | undefined> {
    return new Observable((observer) => {
      const collRef = collection(this.fireStore, 'players');

      const unsubscribe = onSnapshot(collRef, (snapshot: QuerySnapshot) => {
        const doc = snapshot.docs.find((d) => d.id === id);
        if (doc) {
          observer.next(this.mapDocToPlayer(doc.data(), doc.id));
        } else {
          observer.next(undefined);
        }
      });

      return () => unsubscribe();
    });
  }

  subscribeToPlayers(): Observable<Player[]> {
    const q = query(
      collection(this.fireStore, 'players'),
      orderBy('score', 'desc'),
      orderBy('joined_at', 'asc'),
    );

    return new Observable((observer) => {
      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
        const players = snapshot.docs.map((doc) => this.mapDocToPlayer(doc.data(), doc.id));
        observer.next(players);
      });

      return () => unsubscribe();
    });
  }

  getPlayersInRoom(roomId: string): Observable<Player[]> {
    // Define the path to the subcollection
    const playersCollectionPath = `rooms/${roomId}/players`;

    // Create a reference to the collection
    const playersColRef = firestoreCollection(this.fireStore, playersCollectionPath);

    const playersQuery = query(playersColRef, orderBy('joined_at', 'asc'));

    // Fetch the data as an observable.
    // Passing { idField: 'id' } automatically maps the Firestore document ID to a property named 'id'
    return collectionData(playersQuery, { idField: 'id' }) as Observable<Player[]>;
  }

  updatePlayerScore(playerId: string, score: number, answers: number[]): Observable<void> {
    return new Observable((observer) => {
      const playerRef = doc(this.fireStore, 'players', playerId);

      updateDoc(playerRef, {
        score,
        answers,
        completed_at: new Date(),
      })
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((err: any) => observer.error(err));
    });
  }

  private mapDocToPlayer(data: any, id: string): Player {
    return {
      id,
      name: data.name,
      score: data.score,
    };
  }
}
