import { Component } from '@angular/core';
import { LucideZap } from '@lucide/angular';
import { Stepper } from './components/stepper/stepper';
@Component({
  selector: 'app-join-room',
  imports: [LucideZap, Stepper],
  templateUrl: './join-room.html',
  styleUrl: './join-room.css',
  standalone: true,
})
export class JoinRoom {
  value: string | undefined;
}
