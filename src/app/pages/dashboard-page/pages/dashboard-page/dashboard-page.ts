import { Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { RoomCard } from './components/room-card/room-card';

@Component({
  selector: 'app-dashboard-page',
  imports: [ButtonModule, RoomCard],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {}
