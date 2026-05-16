import { Routes } from '@angular/router';
import { JoinRoomPage } from './pages/join-room-page/join-room-page';
import { QuizPage } from './pages/quiz-page/quiz-page';
import { CreateRoomPage } from './pages/create-room-page/create-room-page';

export const routes: Routes = [
  {
    path: 'join',
    component: JoinRoomPage,
  },
  {
    path: 'create-room',
    component: CreateRoomPage,
  },
  {
    path: 'quiz-blitz',
    component: QuizPage,
  },
  {
    path: '**',
    redirectTo: 'join',
    pathMatch: 'full',
  },
];
