import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { playerStore } from '@stores/player.store';

export const roomGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const hasRoomId = !!localStorage.getItem('roomId') || !!playerStore.getValue().roomId;
  if (!hasRoomId) {
    router.navigate(['/join']);
    return false;
  }
  return true;
};
