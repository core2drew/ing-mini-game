import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Auth, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db!: Firestore;
  private auth!: Auth;
  private authState!: Observable<User | null>;
  private currentUser: User | null = null;
  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
    this.auth = getAuth(app);
    this.authState = authState(this.auth);
    this.currentUser = this.auth.currentUser;
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

  getAuthState() {
    return this.authState;
  }

  getAuth(): Auth {
    return this.auth;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}
