import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { Subject } from 'rxjs';
import { AuthService } from '@services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MessageModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
})
export class Login {
  form!: FormGroup;
  showSignUp = false;
  loading = false;
  error = '';

  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.createForm();
  }

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
    this.authService.signIn(username, password).catch((errCode) => {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errCode,
      });
    });
  }
}
