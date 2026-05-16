import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db!: Firestore;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);

    enableIndexedDbPersistence(this.db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence only enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn(
          'The current browser does not support all of the features required to enable persistence.',
        );
      }
    });
  }

  getDb(): Firestore {
    return this.db;
  }
}
