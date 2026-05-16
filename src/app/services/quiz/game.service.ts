import { Injectable } from '@angular/core';
import { QuestionService } from './question.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private questionService: QuestionService) {}

  calculateScore(answers: number[]): number {
    const questions = this.questionService.getQuestions();
    let score = 0;

    answers.forEach((answer, index) => {
      if (answer === questions[index].correctIndex) {
        score++;
      }
    });

    return score;
  }

  isAnswerCorrect(questionIndex: number, answerIndex: number): boolean {
    const questions = this.questionService.getQuestions();
    return answerIndex === questions[questionIndex].correctIndex;
  }

  isLastQuestion(currentIndex: number): boolean {
    return currentIndex === this.questionService.getQuestionCount() - 1;
  }
}
