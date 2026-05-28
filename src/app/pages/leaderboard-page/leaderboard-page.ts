import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { LeaderboardRow } from '@models/quiz/leaderboard.model';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-leaderboard-page',
  imports: [TableModule, SkeletonModule, CommonModule],
  templateUrl: './leaderboard-page.html',
  styleUrl: './leaderboard-page.css',
})
export class LeaderboardPage {
  loading = signal(true);
  leaderboardData = signal<LeaderboardRow[]>([]);
  lastUpdated = signal(new Date());

  stats = signal({
    totalPlayers: 0,
    highestScore: 0,
    totalGames: 0,
  });

  async ngOnInit() {
    await this.loadLeaderboard();
  }

  async loadLeaderboard() {
    this.loading.set(true);
    try {
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async refreshData() {
    await this.loadLeaderboard();
  }

  getRowClass(rank: number): string {
    if (rank === 1) {
      return 'bg-gradient-to-r from-amber-900/20 to-transparent hover:from-amber-900/30';
    } else if (rank === 2) {
      return 'bg-gradient-to-r from-slate-600/20 to-transparent hover:from-slate-600/30';
    } else if (rank === 3) {
      return 'bg-gradient-to-r from-orange-900/20 to-transparent hover:from-orange-900/30';
    }
    return 'hover:bg-slate-700/30';
  }
}
