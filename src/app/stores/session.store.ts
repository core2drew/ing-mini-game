import { createStore, withProps } from '@ngneat/elf';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';

export interface SessionProps {
  roomId: string | null;
  name: string | null;
}

export const sessionStore = createStore(
  {
    name: 'session',
  },
  withProps<SessionProps>({
    name: null as string | null,
    roomId: null as string | null,
  }),
);

persistState(sessionStore, {
  key: 'game_session',
  storage: localStorageStrategy,
});

// 3. Export clean mutations (updates)
export function updateSession(roomId: string, name: string) {
  sessionStore.update((state) => ({ ...state, roomId, name }));
}

export function clearSession() {
  localStorage.removeItem('game_session');
  sessionStore.update(() => ({ roomId: null, name: null }));
}
