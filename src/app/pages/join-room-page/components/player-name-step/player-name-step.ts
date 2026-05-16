import { Component, EventEmitter, Output } from '@angular/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-player-name-step',
  imports: [FloatLabelModule, InputTextModule],
  templateUrl: './player-name-step.html',
  styleUrl: './player-name-step.css',
  standalone: true,
})
export class PlayerNameStep {
  @Output() nextStep = new EventEmitter<number>();

  joinGame() {
    this.nextStep.emit(3);
  }
}
