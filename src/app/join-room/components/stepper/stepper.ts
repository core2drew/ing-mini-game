import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { RoomStep } from '../room-step/room-step';
import { PlayerNameStep } from '../player-name-step/player-name-step';

@Component({
  selector: 'app-stepper',
  imports: [StepperModule, RoomStep, PlayerNameStep],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper {}
