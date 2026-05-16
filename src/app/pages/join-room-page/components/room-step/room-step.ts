import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoomService } from '@services/room/room.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { model } from '@angular/core';
@Component({
  selector: 'app-room-step',
  imports: [InputMaskModule, InputTextModule, FloatLabelModule, FormsModule],
  templateUrl: './room-step.html',
  styleUrl: './room-step.css',
  standalone: true,
})
export class RoomStep {
  @Output() nextStep = new EventEmitter<number>();
  roomId = ''; // Initialize roomId as a model of type string

  constructor(private roomService: RoomService) {}

  joinRoom() {
    this.roomService.joinRoom(this.roomId!).then((exists) => {
      if (exists) {
        this.nextStep.emit(2);
      } else {
        alert('Room does not exist');
      }
    });
  }
}
