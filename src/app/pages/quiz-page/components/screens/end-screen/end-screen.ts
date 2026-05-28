import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '@services/session/session.service';
import { getCorrectRandomInspirationalMessage } from '@utils/inspirational-message-utils';

@Component({
  selector: 'app-end-screen',
  imports: [],
  templateUrl: './end-screen.html',
  styleUrl: './end-screen.css',
})
export class EndScreen {
  private sessionService = inject(SessionService);
  private router = inject(Router);

  confetti = signal<{ x: number; delay: number; color: string; size: number; dur: number }[]>([]);
  showContent = signal(false);
  inspirationalMessage = signal(getCorrectRandomInspirationalMessage());

  private colors = ['#22c55e', '#86efac', '#4ade80', '#fbbf24', '#34d399', '#a3e635'];

  ngOnInit(): void {
    this.confetti.set(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        delay: Math.random() * 1.5,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        size: 6 + Math.random() * 8,
        dur: 2 + Math.random() * 2,
      })),
    );
    setTimeout(() => this.showContent.set(true), 100);
  }

  close() {
    this.sessionService.clearSession();
    this.router.navigate(['/join']);
  }
}
