import { Component, computed, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-end-screen',
  imports: [],
  templateUrl: './end-screen.html',
  styleUrl: './end-screen.css',
})
export class EndScreen {
  confettiContainer = viewChild<ElementRef>('confettiContainer');

  // Quiz results data (simulated - in real app, this would come from a service)
  correctAnswers = signal(18);
  totalQuestions = signal(20);
  timeTaken = signal(342); // in seconds

  // Computed values
  incorrectAnswers = computed(() => this.totalQuestions() - this.correctAnswers());
  questionsAnswered = computed(() => this.totalQuestions());
  scorePercentage = computed(() =>
    Math.round((this.correctAnswers() / this.totalQuestions()) * 100),
  );

  // Display score with animation
  displayScore = signal(0);

  // Score ring animation
  scoreOffset = signal(283);

  performanceMessage = computed(() => {
    const score = this.scorePercentage();
    if (score >= 90) return 'Excellent Work!';
    if (score >= 70) return 'Good Job!';
    if (score >= 50) return 'Keep Practicing!';
    return "Don't Give Up!";
  });

  performanceClass = computed(() => {
    const score = this.scorePercentage();
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  });

  ngOnInit() {
    this.animateScore();
  }

  ngAfterViewInit() {
    if (this.scorePercentage() >= 70) {
      this.createConfetti();
    }
  }

  animateScore() {
    const duration = 1500;
    const steps = 60;
    const increment = this.scorePercentage() / steps;
    const strokeIncrement = (283 * this.scorePercentage()) / 100 / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      this.displayScore.set(Math.round(currentStep * increment));
      this.scoreOffset.set(283 - currentStep * strokeIncrement);

      if (currentStep >= steps) {
        clearInterval(interval);
        this.displayScore.set(this.scorePercentage());
      }
    }, duration / steps);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  restartQuiz() {
    // In real app, navigate to quiz start
    this.correctAnswers.set(0);
    this.displayScore.set(0);
    this.scoreOffset.set(283);

    setTimeout(() => {
      // Reset with new simulated data
      this.correctAnswers.set(Math.floor(Math.random() * 15) + 5);
      this.animateScore();
      if (this.scorePercentage() >= 70) {
        this.createConfetti();
      }
    }, 300);
  }

  shareResults() {
    const shareText = `I scored ${this.scorePercentage()}% on the quiz! ${this.correctAnswers()}/${this.totalQuestions()} correct answers. Can you beat my score?`;

    if (navigator.share) {
      navigator.share({
        title: 'Quiz Results',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  }

  reviewAnswers() {
    // In real app, navigate to review page
    console.log('Navigate to review answers');
  }

  createConfetti() {
    const container = this.confettiContainer();
    if (!container) return;

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -20px;
        opacity: ${Math.random() * 0.5 + 0.5};
        transform: rotate(${Math.random() * 360}deg);
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        animation: confetti-fall ${Math.random() * 3 + 2}s ease-out forwards;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      container.nativeElement.appendChild(confetti);
    }
  }
}
