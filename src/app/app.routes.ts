import { Routes } from '@angular/router';
import { JoinRoomPage } from './pages/join-room-page/join-room-page';
import { QuizPage } from './pages/quiz-page/quiz-page';
import { CreateRoomPage } from './pages/create-room-page/create-room-page';
import { roomGuard } from './guards/room-guard/room-guard';

export const routes: Routes = [
  {
    path: 'join',
    component: JoinRoomPage,
  },
  {
    path: 'quiz-blitz',
    component: QuizPage,
    canActivate: [roomGuard],
  },
  {
    path: 'create-room',
    component: CreateRoomPage,
  },
  {
    path: '**',
    redirectTo: 'join',
    pathMatch: 'full',
  },
];
