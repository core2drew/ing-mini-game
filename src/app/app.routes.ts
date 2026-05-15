import { Routes } from '@angular/router';
import { JoinRoom } from './join-room/join-room';
import { GamePage } from './game-page/game-page';

export const routes: Routes = [
  {
    path: 'game',
    component: GamePage,
  },
  {
    path: '',
    component: JoinRoom,
  },
];
