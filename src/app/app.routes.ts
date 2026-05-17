import { Routes } from '@angular/router';
import { roomGuard } from './guards/room-guard/room-guard';
import { authGuard } from './guards/auth/auth-guard';
import { unauthGuard } from './guards/unauth/unauth-guard';

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
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
    canActivate: [unauthGuard],
  },
  {
    path: 'create-room',
    loadComponent: () =>
      import('./pages/create-room-page/create-room-page').then((m) => m.CreateRoomPage),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'join',
    pathMatch: 'full',
  },
];
