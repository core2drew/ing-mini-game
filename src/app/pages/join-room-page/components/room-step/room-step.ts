import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-room-step',
  imports: [InputMaskModule, InputTextModule, FloatLabelModule, FormsModule],
  templateUrl: './room-step.html',
  styleUrl: './room-step.css',
  standalone: true,
})
export class RoomStep {
  @Output() nextStep = new EventEmitter<number>();

  joinRoom() {
    this.nextStep.emit(2);
  }
}
