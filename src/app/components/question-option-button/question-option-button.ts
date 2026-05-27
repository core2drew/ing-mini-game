import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { OPTION_CONFIG } from './constants/question-options-button.constant';

@Component({
  selector: 'app-question-option-button',
  imports: [CommonModule],
  templateUrl: './question-option-button.html',
  styleUrl: './question-option-button.css',
  standalone: true,
})
export class QuestionOptionButton {
  @Input() option: string = '';
  @Input() index: number = 0;
  @Input() isSelected: boolean = false;
  @Input() isCorrect: boolean = false;
  @Input() isRevealed: boolean = false;

  get colorConfig() {
    return OPTION_CONFIG[this.index];
  }

  get buttonClass(): string {
    if (!this.isRevealed && !this.isSelected) {
      return `${this.colorConfig.bg} text-white`;
    }

    if (this.isSelected && !this.isRevealed) {
      return `bg-slate-800 text-white outline-2 outline-white cursor-default`;
    }

    if (this.isSelected && !this.isCorrect) {
      return 'bg-red-500 text-white ring-2 ring-red-300';
    }

    if (this.isCorrect) {
      return 'bg-green-500 text-white ring-2 ring-green-300';
    }

    return 'bg-slate-800 text-slate-100 cursor-default';
  }

  get disabled(): boolean {
    return this.isRevealed;
  }
}
