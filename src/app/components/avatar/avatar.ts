import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { LucideStar } from '@lucide/angular';
import { Player } from '@models/quiz/player.model';
import { getAvatarColorByName } from '@utils/player-utils';

@Component({
  selector: 'app-avatar',
  imports: [CommonModule, LucideStar],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
  standalone: true,
})
export class Avatar {
  player = input<Player | undefined>();
  showName = input<boolean>(true);
  showStar = input<boolean>(false);
  horizontal = input<boolean>(false);

  get avatarColor() {
    const { name } = this.player() || {};
    return getAvatarColorByName(name!);
  }

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
