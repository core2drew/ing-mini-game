import { Component, input } from '@angular/core';
import { Avatar } from '../../../../../../components/avatar/avatar';
import { Player } from '@models/quiz/player.model';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
@Component({
  selector: 'app-player-list',
  imports: [CardModule, DividerModule, Avatar],
  templateUrl: './player-list.html',
  styleUrl: './player-list.css',
})
export class PlayerList {
  playersAvatars = input<Player[] | undefined>(undefined);
}
