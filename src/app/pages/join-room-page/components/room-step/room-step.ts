import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoomService } from '@services/room/room.service';
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-room-step',
  imports: [
    InputMaskModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ToastModule,
    RippleModule,
    ButtonModule,
  ],
  templateUrl: './room-step.html',
  styleUrl: './room-step.css',
  standalone: true,
  providers: [MessageService],
})
export class RoomStep {
  @Output() nextStep = new EventEmitter<number>();
  loading = false;
  roomId = ''; // Initialize roomId as a model of type string
  private messageService = inject(MessageService);
  constructor(private roomService: RoomService) {}

  joinRoom() {
    this.loading = true;
    this.roomService
      .joinRoom(this.roomId!)
      .then((exists) => {
        if (exists) {
          this.nextStep.emit(2);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Room does not exist',
          });
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
