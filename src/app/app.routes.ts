import { Routes } from '@angular/router';
import { roomGuard } from './guards/room-guard/room-guard';

export const routes: Routes = [
  {
    path: 'join',
    loadComponent: () =>
      import('./pages/join-room-page/join-room-page').then((m) => m.JoinRoomPage),
  },
  {
    path: 'quiz-blitz',
    loadComponent: () => import('./pages/quiz-page/quiz-page').then((m) => m.QuizPage),
    canActivate: [roomGuard],
  },
  {
    path: 'create-room',
    loadComponent: () =>
      import('./pages/create-room-page/create-room-page').then((m) => m.CreateRoomPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: '**',
    redirectTo: 'join',
    pathMatch: 'full',
  },
];
