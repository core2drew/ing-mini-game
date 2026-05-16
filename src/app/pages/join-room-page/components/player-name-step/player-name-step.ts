import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
@Component({
  selector: 'app-player-name-step',
  imports: [FloatLabelModule, InputTextModule, FormsModule, ButtonModule, MessageModule],
  templateUrl: './player-name-step.html',
  styleUrl: './player-name-step.css',
  standalone: true,
})
export class PlayerNameStep {
  @Output() nextStep = new EventEmitter<number>();
  loading = false;
  playerName: any;

  enterGame(form: any) {
    if (form.valid) {
      this.nextStep.emit(3);
    }
  }
}
