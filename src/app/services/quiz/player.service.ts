import { Injectable } from '@angular/core';
import { FirebaseService } from '@services/firebase.service';
import {
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Player } from '@models/quiz/player.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor(private firebaseService: FirebaseService) {}

  createPlayer(name: string): Observable<Player> {
    return new Observable((observer) => {
      const db = this.firebaseService.getDb();
      addDoc(collection(db, 'players'), {
        name: name.trim(),
        score: 0,
        answers: [],
        joined_at: new Date(),
      })
        .then((docRef) => {
          const newPlayer: Player = {
            id: docRef.id,
            name: name.trim(),
            score: 0,
            answers: [],
            joined_at: new Date(),
          };
          observer.next(newPlayer);
          observer.complete();
        })
        .catch((err: any) => observer.error(err));
    });
  }

  getPlayer(id: string): Observable<Player | undefined> {
    return new Observable((observer) => {
      const db = this.firebaseService.getDb();
      const collRef = collection(db, 'players');

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
    const db = this.firebaseService.getDb();
    const q = query(
      collection(db, 'players'),
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

  updatePlayerScore(playerId: string, score: number, answers: number[]): Observable<void> {
    return new Observable((observer) => {
      const db = this.firebaseService.getDb();
      const playerRef = doc(db, 'players', playerId);

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
      answers: data.answers || [],
      joined_at: data.joined_at ? data.joined_at.toDate() : new Date(),
      completed_at: data.completed_at ? data.completed_at.toDate() : undefined,
    };
  }
}
