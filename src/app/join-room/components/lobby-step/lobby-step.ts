import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-lobby-step',
  imports: [TableModule],
  templateUrl: './lobby-step.html',
  styleUrl: './lobby-step.css',
  standalone: true,
})
export class LobbyStep {
  private router = inject(Router);
  players = [
    {
      name: 'John Doe',
    },
    {
      name: 'Jane Doe',
    },
  ];

  ngOnInit() {
    // this.router.navigate(['/game']);
  }
}
