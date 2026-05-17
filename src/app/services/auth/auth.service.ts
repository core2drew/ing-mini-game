import { inject, Injectable } from '@angular/core';
import { signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirebaseService } from '@services/firebase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private firebaseService = inject(FirebaseService);

  async signIn(email: string, password: string) {
    try {
      const auth = this.firebaseService.getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      const err = error as { code: string };
      const errCode = err.code;
      throw errCode;
    }
  }

  getUser() {
    return this.firebaseService.getCurrentUser();
  }

  getAuthState() {
    return this.firebaseService.getAuthState();
  }

  async signOut() {
    const auth = this.firebaseService.getAuth();
    await auth.signOut();
    this.router.navigate(['/login']);
  }
}
