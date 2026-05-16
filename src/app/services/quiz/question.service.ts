import { Injectable } from '@angular/core';
import { Question } from '@models/quiz/question.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private questions: Question[] = [
    {
      id: 0,
      text: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctIndex: 2,
      color: '#3B82F6',
    },
    {
      id: 1,
      text: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctIndex: 1,
      color: '#10B981',
    },
    {
      id: 2,
      text: 'How many sides does a hexagon have?',
      options: ['5', '6', '7', '8'],
      correctIndex: 1,
      color: '#F59E0B',
    },
    {
      id: 3,
      text: 'Which element has the chemical symbol "O"?',
      options: ['Gold', 'Oxygen', 'Osmium', 'Oganesson'],
      correctIndex: 1,
      color: '#EF4444',
    },
  ];

  getQuestions(): Question[] {
    return this.questions;
  }

  getQuestionCount(): number {
    return this.questions.length;
  }
}
