import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoomService } from '@services/room/room.service';
import { sessionStore } from '@stores/session.store';

export const roomGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const roomService = inject(RoomService);

  const hasRoomId = !!localStorage.getItem('roomId') || !!sessionStore.getValue().roomId;

  if (!hasRoomId) {
    router.navigate(['/join']);
    return false;
  }
  return true;
};
