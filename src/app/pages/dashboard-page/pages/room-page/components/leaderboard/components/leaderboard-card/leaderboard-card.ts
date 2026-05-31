import { Component, Input } from '@angular/core';
import { Player } from '@models/quiz/player.model';
import { Avatar } from '../../../../../../../../components/avatar/avatar';
import { PlayerStatusChip } from '../../../player-status-chip/player-status-chip';
import { getRankConfig } from '@utils/leaderboard.utils';

@Component({
  selector: 'app-leaderboard-card',
  imports: [Avatar, PlayerStatusChip],
  templateUrl: './leaderboard-card.html',
  styleUrl: './leaderboard-card.css',
})
export class LeaderboardCard {
  @Input() player: Player | undefined;
  @Input() medal: number = 0;

  protected getRankConfig = getRankConfig;
}
