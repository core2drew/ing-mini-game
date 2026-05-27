import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayerWithUIData } from '@models/quiz/player.model';
import { getPlayerStatusStyleClass } from '@utils/player-utils';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-player-status-chip',
  imports: [ChipModule, CommonModule],
  templateUrl: './player-status-chip.html',
  styleUrl: './player-status-chip.css',
})
export class PlayerStatusChip {
  @Input() player: PlayerWithUIData | undefined;

  get getStatusStyle() {
    return getPlayerStatusStyleClass(this.player?.status);
  }
}
