import { Component, input } from '@angular/core';
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
  playersAvatars = input<PlayerWithUIData[] | undefined>(undefined);

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
