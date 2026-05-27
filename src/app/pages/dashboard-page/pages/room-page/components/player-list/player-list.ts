import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-player-list',
  imports: [CardModule],
  templateUrl: './player-list.html',
  styleUrl: './player-list.css',
})
export class PlayerList {}
