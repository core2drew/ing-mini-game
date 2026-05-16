import { inject, Injectable } from '@angular/core';
import { QuestionService } from './question.service';
import { filter, map, Observable, take } from 'rxjs';
import { FirebaseService } from '@services/firebase.service';
import { doc, onSnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private questionService = inject(QuestionService);

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
