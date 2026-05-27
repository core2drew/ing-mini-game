import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayerStatus } from '@models/quiz/player.model';
import { getPlayerStatusLabel, getPlayerStatusStyleClass } from '@utils/player-utils';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-player-status-chip',
  imports: [ChipModule, CommonModule],
  templateUrl: './player-status-chip.html',
  styleUrl: './player-status-chip.css',
})
export class PlayerStatusChip {
  @Input() status: PlayerStatus | undefined;
  @Input() textOnly: boolean = false;

  get statusStyle() {
    return getPlayerStatusStyleClass(this.status);
  }

  get statusText() {
    return getPlayerStatusLabel(this.status);
  }
}
