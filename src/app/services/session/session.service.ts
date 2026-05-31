import { computed, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { clearSession, sessionStore, updateSession } from '@stores/session.store';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  // 1. Convert the underlying Elf RxJS observables directly into Signals
  roomId = toSignal(sessionStore.pipe(map((s) => s.roomId)), { initialValue: null });
  playerName = toSignal(sessionStore.pipe(map((s) => s.name)), { initialValue: null });
  clearSession = clearSession;

  // 2. Derived state: check if the local user is actively authenticated in a room
  isLoggedIn = computed(() => !!this.roomId() && !!this.playerName());

  joinRoom(roomId: string, playerName: string) {
    updateSession(roomId, playerName);
  }
}
