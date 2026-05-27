import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { PlayerWithUIData } from '@models/quiz/player.model';

@Component({
  selector: 'app-avatar',
  imports: [CommonModule],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
  standalone: true,
})
export class Avatar {
  player = input<PlayerWithUIData | undefined>();
  showName = input<boolean>(true);

  get hasEmoji() {
    const { name } = this.player() || {};
    return !!name?.match(/\p{Extended_Pictographic}/gu);
  }

  get playerInitial() {
    const { name } = this.player() || {};
    const emojis = name?.match(/\p{Extended_Pictographic}/gu);
    if (emojis) {
      return emojis[0];
    }
    return name?.charAt(0)?.toUpperCase();
  }
}
