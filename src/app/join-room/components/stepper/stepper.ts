import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { RoomStep } from '../room-step/room-step';
import { PlayerNameStep } from '../player-name-step/player-name-step';
import { LobbyStep } from '../lobby-step/lobby-step';

@Component({
  selector: 'app-stepper',
  imports: [StepperModule, RoomStep, PlayerNameStep, LobbyStep],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper {}
