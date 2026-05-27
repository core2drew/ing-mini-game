import { Component, computed, inject } from '@angular/core';
import { Stepper } from './components/stepper/stepper';
import { SessionService } from '@services/session/session.service';
@Component({
  selector: 'app-join-room-page',
  imports: [Stepper],
  templateUrl: './join-room-page.html',
  styleUrl: './join-room-page.css',
  standalone: true,
})
export class JoinRoomPage {
  private sessionService = inject(SessionService);

  readonly currentStep = computed(() => {
    const roomId = this.sessionService.roomId();
    const playerName = this.sessionService.playerName();

    if (roomId && playerName) return 3;
    if (roomId) return 2;

    return 1;
  });
}
