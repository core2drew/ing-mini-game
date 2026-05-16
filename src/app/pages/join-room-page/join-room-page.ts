import { Component } from '@angular/core';
import { LucideZap } from '@lucide/angular';
import { Stepper } from './components/stepper/stepper';
@Component({
  selector: 'app-join-room-page',
  imports: [LucideZap, Stepper],
  templateUrl: './join-room-page.html',
  styleUrl: './join-room-page.css',
  standalone: true,
})
export class JoinRoomPage {
  value: string | undefined;
}
