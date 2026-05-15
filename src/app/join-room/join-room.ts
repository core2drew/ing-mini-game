import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideZap } from '@lucide/angular';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-join-room',
  imports: [LucideZap, InputMaskModule, InputTextModule, FormsModule],
  templateUrl: './join-room.html',
  styleUrl: './join-room.css',
  standalone: true,
})
export class JoinRoom {
  value: string | undefined;
}
