import { Component, signal } from '@angular/core';
import { IdleTextDot } from '../../../../../components/idle-text-dot/idle-text-dot';

@Component({
  selector: 'app-correct-answer-screen',
  imports: [IdleTextDot],
  templateUrl: './correct-answer-screen.html',
  styleUrl: './correct-answer-screen.css',
})
export class CorrectAnswerScreen {
  confetti = signal<{ x: number; delay: number; color: string; size: number; dur: number }[]>([]);
  showContent = signal(false);

  private colors = ['#22c55e', '#86efac', '#4ade80', '#fbbf24', '#34d399', '#a3e635'];

  getRandomInspirationalMessage() {
    const inspirationMessages = [
      'Excellent work — you nailed it!',
      'Brilliantly done — you really knocked it out of the park!',
      'Okay, we get it—you’re the main character. Keep slaying.',
      'Amazing job. Now please go sit in a corner so the rest of us can feel like we’re contributing something.',
      `Wow, nailed it. I'd congratulate you, but I don't want to encourage you to keep making us look bad.`,
      `You did it perfectly on the first try. I hate you a little bit, but mostly I’m just impressed.`,
      `Congratulations on achieving basic competence. We are all very proud of you doing your job.`,
      `Oh, look at that. You did the job you were actually supposed to do. Someone notify the media.`,
      `Excellent work — you nailed it! Do you want a medal, or can we finally move on with our lives?`,
    ];
    return inspirationMessages[Math.floor(Math.random() * inspirationMessages.length)];
  }

  inspirationMessage = signal(this.getRandomInspirationalMessage());

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
