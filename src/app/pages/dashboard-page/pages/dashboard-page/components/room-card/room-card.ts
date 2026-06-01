import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-room-card',
  imports: [CardModule, ChipModule, ButtonModule],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css',
})
export class RoomCard {
  private router = inject(Router);

  roomId = input<string>('');

  navigateToRoom() {
    this.router.navigate(['/room', this.roomId()]);
  }
}
