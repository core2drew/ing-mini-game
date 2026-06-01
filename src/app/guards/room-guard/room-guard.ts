import { effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { PlayerStatus } from '@models/quiz/player.model';

import { PlayerService } from '@services/quiz/player.service';
import { sessionStore } from '@stores/session.store';

export const roomGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  const playerService = inject(PlayerService);
  const roomId = sessionStore.getValue().roomId;
  const playerName = sessionStore.getValue().name;
  // We need to convert the observable to a signal so that we can use it in the guard
  const player = toSignal(playerService.getPlayer(roomId!, playerName!)); // Wait for the player signal to emit its first value

  await new Promise((resolve) => {
    const effectRef = effect(() => {
      if (player() !== undefined) {
        effectRef.destroy();
        resolve(true);
      }
    });
  });

  const hasRoomId = !!localStorage.getItem('roomId') || !!sessionStore.getValue().roomId;

  if (!hasRoomId || !player()) {
    router.navigate(['/join']);
    return false;
  }

  if (player()?.status === PlayerStatus.WAITING) {
    router.navigate(['/join']);
    return false;
  }

  return true;
};
