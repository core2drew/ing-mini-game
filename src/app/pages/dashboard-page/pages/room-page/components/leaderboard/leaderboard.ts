import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { LeaderboardCard } from './components/leaderboard-card/leaderboard-card';
import { Player } from '@models/quiz/player.model';

@Component({
  selector: 'app-leaderboard',
  imports: [CardModule, DividerModule, LeaderboardCard],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard {
  players = input<Player[]>([]);
}
