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
import { playerStore } from '../../../../stores/player.store';
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
})
export class RoomStep {
  @Output() nextStep = new EventEmitter<number>();
  loading = false;
  roomId = ''; // Initialize roomId as a model of type string

  private messageService = inject(MessageService);
  private roomService = inject(RoomService);

  joinRoom() {
    this.loading = true;
    this.roomService
      .joinRoom(this.roomId!)
      .then((canJoin) => {
        if (canJoin) {
          this.nextStep.emit(2);
          playerStore.update((state) => ({ ...state, roomId: this.roomId }));
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Room does not exist',
          });
        }
      })
      .catch((error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to join room. Please try again.',
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
