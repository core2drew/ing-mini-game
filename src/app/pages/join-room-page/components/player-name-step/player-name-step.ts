import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { sessionStore } from '@stores/session.store';
import { PlayerService } from '@services/quiz/player.service';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { LogoTitle } from '../logo-title/logo-title';
@Component({
  selector: 'app-player-name-step',
  imports: [FloatLabelModule, InputTextModule, FormsModule, ButtonModule, MessageModule, LogoTitle],
  templateUrl: './player-name-step.html',
  styleUrl: './player-name-step.css',
  standalone: true,
})
export class PlayerNameStep {
  @Output() nextStep = new EventEmitter<number>();
  loading = false;
  playerName: string | undefined = undefined;

  private playerService = inject(PlayerService);
  private messageService = inject(MessageService);

  enterGame(form: any) {
    if (form.valid) {
      // In your component.ts before saving

      this.loading = true;
      this.playerName = this.playerName?.trim();
      if (this.playerName) {
        this.playerService.createPlayer(this.playerName!).subscribe({
          next: (player) => {
            sessionStore.update((state) => ({ ...state, name: player.name }));
            this.nextStep.emit(3);
          },
          error: (error) => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              styleClass: 'border-none',
              contentStyleClass: 'bg-slate-800/60',
              summary: 'Error',
              detail: error.message,
            });
          },
        });
      } else {
        this.messageService.add({
          severity: 'error',
          styleClass: 'border-none',
          contentStyleClass: 'bg-slate-800/60',
          summary: 'Error',
          detail: 'Please enter a valid name',
        });
      }
    }
    this.loading = false;
  }
}
