import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private auth = inject(AngularFireAuth);

  async signIn(email: string, password: string) {
    try {
      await this.auth.signInWithEmailAndPassword(email, password);
      this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      const err = error as { code: string };
      const errCode = err.code;
      throw errCode;
    }
  }

  getUser() {
    return this.auth.currentUser;
  }

  getAuthState() {
    return this.auth.authState;
  }

  async signOut() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
