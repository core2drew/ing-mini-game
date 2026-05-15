import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-lobby-step',
  imports: [TableModule],
  templateUrl: './lobby-step.html',
  styleUrl: './lobby-step.css',
  standalone: true,
})
export class LobbyStep {
  players = [
    {
      name: 'John Doe',
    },
    {
      name: 'Jane Doe',
    },
  ];
}
