import { Routes } from '@angular/router';
import { JoinRoom } from './join-room/join-room';
import { QuizPage } from './quiz-page/quiz-page';

export const routes: Routes = [
  {
    path: '',
    component: JoinRoom,
  },
  {
    path: 'quiz',
    component: QuizPage,
  },
];
