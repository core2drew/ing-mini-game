import { Component, inject } from '@angular/core';
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

  currentStep: number = 1;

  ngOnInit() {
    if (this.sessionService.isLoggedIn()) {
      this.currentStep = 3;
    }
  }
}
