import { Component, Input } from '@angular/core';
import { Player } from '@models/quiz/player.model';
import { Avatar } from '../../../../../../../../components/avatar/avatar';

@Component({
  selector: 'app-leaderboard-card',
  imports: [Avatar],
  templateUrl: './leaderboard-card.html',
  styleUrl: './leaderboard-card.css',
})
export class LeaderboardCard {
  @Input() player: Player | undefined;
}
