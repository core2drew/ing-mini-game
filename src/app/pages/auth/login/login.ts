import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { Subject, takeUntil, finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit, OnDestroy {
  form!: FormGroup;
  showSignUp = false;
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  toggleSignUp(): void {
    this.showSignUp = !this.showSignUp;
    this.error = '';
    this.form.reset();
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const { username, password } = this.form.value;
    this.loading = true;
    this.error = '';

    const auth$ = this.showSignUp;
    //   ? this.supabase.signUp(username, password, 'player')
    //   : this.supabase.signIn(username, password);

    // auth$
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     finalize(() => (this.loading = false)),
    //   )
    //   .subscribe({
    //     next: () => {
    //       this.router.navigate(['/dashboard']);
    //     },
    //     error: (err) => {
    //       this.error = err?.message || 'Authentication failed. Please try again.';
    //     },
    //   });
  }
}
