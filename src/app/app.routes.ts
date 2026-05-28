import { Routes } from '@angular/router';
import { roomGuard } from './guards/room-guard/room-guard';
import { unauthGuard } from './guards/unauth/unauth-guard';
import { wildcardGuard } from './guards/unauth/wildcard-guard/wildcard-guard';

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
    canActivate: [wildcardGuard],
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
        path: 'room/:roomId/leaderboard',
        loadComponent: () =>
          import(`./pages/dashboard-page/pages/leaderboard-page/leaderboard-page`).then(
            (m) => m.LeaderboardPage,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'join',
    pathMatch: 'full',
  },
];
