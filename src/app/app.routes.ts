import { Routes } from '@angular/router';
import { roomGuard } from './guards/room-guard/room-guard';
import { authGuard } from './guards/auth/auth-guard';
import { unauthGuard } from './guards/unauth/unauth-guard';

export const routes: Routes = [
  {
    path: 'join',
    loadComponent: () =>
      import(`./pages/join-room-page/join-room-page`).then((m) => m.JoinRoomPage),
  },
  {
    path: 'quiz-blitz',
    loadComponent: () => import(`./pages/quiz-page/quiz-page`).then((m) => m.QuizPage),
    canActivate: [roomGuard],
  },

  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
    canActivate: [unauthGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard-page/pages/dashboard-page/dashboard-page').then(
            (m) => m.DashboardPage,
          ),
      },
      {
        path: 'create-room',
        loadComponent: () =>
          import(`./pages/dashboard-page/pages/create-room-page/create-room-page`).then(
            (m) => m.CreateRoomPage,
          ),
      },
      {
        path: 'room/:roomId',
        loadComponent: () =>
          import(`./pages/dashboard-page/pages/room-page/room-page`).then((m) => m.RoomPage),
      },
      {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/join',
    pathMatch: 'full',
  },
];
