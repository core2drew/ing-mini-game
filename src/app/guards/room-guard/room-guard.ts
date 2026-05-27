import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { sessionStore } from '@stores/session.store';

export const roomGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const hasRoomId = !!localStorage.getItem('roomId') || !!sessionStore.getValue().roomId;
  if (!hasRoomId) {
    router.navigate(['/join']);
    return false;
  }
  return true;
};
