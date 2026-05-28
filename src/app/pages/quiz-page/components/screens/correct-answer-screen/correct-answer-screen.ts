import { Component, Input, signal } from '@angular/core';
import { IdleTextDot } from '../../../../../components/idle-text-dot/idle-text-dot';
import { getCorrectRandomInspirationalMessage } from '@utils/inspirational-message-utils';

@Component({
  selector: 'app-correct-answer-screen',
  imports: [IdleTextDot],
  templateUrl: './correct-answer-screen.html',
  styleUrl: './correct-answer-screen.css',
})
export class CorrectAnswerScreen {
  @Input() score: number = 0;

  confetti = signal<{ x: number; delay: number; color: string; size: number; dur: number }[]>([]);
  showContent = signal(false);

  private colors = ['#22c55e', '#86efac', '#4ade80', '#fbbf24', '#34d399', '#a3e635'];

  get inspirationalMessage() {
    return getCorrectRandomInspirationalMessage();
  }

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
}
