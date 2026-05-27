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
}
