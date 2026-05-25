import { Component, input } from '@angular/core';

@Component({
  selector: 'app-idle-text-dot',
  imports: [],
  templateUrl: './idle-text-dot.html',
  styleUrl: './idle-text-dot.css',
})
export class IdleTextDot {
  dots = [0, 1, 2];
  text = input<string>('Waiting');
}
