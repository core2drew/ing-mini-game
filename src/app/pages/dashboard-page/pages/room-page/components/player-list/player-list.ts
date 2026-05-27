import { Component, computed, input } from '@angular/core';
import { Avatar } from '../../../../../../components/avatar/avatar';
import { PlayerStatus, PlayerWithUIData } from '@models/quiz/player.model';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-player-list',
  imports: [CardModule, DividerModule, Avatar, ChipModule, CommonModule],
  templateUrl: './player-list.html',
  styleUrl: './player-list.css',
})
export class PlayerList {
  players = input<PlayerWithUIData[] | undefined>(undefined);

  playerStatusCounts = computed(() => {
    const currentPlayers = this.players() ?? [];

    // Initialize our counter object
    const counts = {
      waiting: 0,
      thinking: 0,
      answered: 0,
      offline: 0,
      total: currentPlayers.length,
    };

    // Single-pass optimization: O(n) instead of running filter multiple times
    for (const player of currentPlayers) {
      switch (player.status) {
        case PlayerStatus.WAITING:
          counts.waiting++;
          break;
        case PlayerStatus.THINKING:
          counts.thinking++;
          break;
        case PlayerStatus.ANSWERED:
          counts.answered++;
          break;
        case PlayerStatus.OFFLINE:
          counts.offline++;
          break;
      }
    }

    return counts;
  });

  getStatusStyle(status: PlayerStatus | undefined) {
    if (status) {
      return {
        waiting: status === PlayerStatus.WAITING,
        thinking: status === PlayerStatus.THINKING,
        answered: status === PlayerStatus.ANSWERED,
        offline: status === PlayerStatus.OFFLINE,
      };
    }
    return {
      unknown: true,
    };
  }
}
