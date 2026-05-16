import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { playerStore } from '@stores/player.store';
import { PlayerService } from '@services/quiz/player.service';
import { MessageService } from 'primeng/api';
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
  playerName: string | null = null;

  private playerService = inject(PlayerService);
  private messageService = inject(MessageService);

  enterGame(form: any) {
    if (form.valid) {
      this.playerService.createPlayer(this.playerName!).subscribe({
        next: (player) => {
          playerStore.update((state) => ({ ...state, name: player.name }));
          this.nextStep.emit(3);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            styleClass: 'border-none',
            contentStyleClass: 'bg-slate-800/60',
            summary: 'Error',
            detail: error.message,
          });
        },
      });
    }
  }
}
