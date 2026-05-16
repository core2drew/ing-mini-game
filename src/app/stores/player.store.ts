import { createStore, withProps } from '@ngneat/elf';

export const playerStore = createStore(
  {
    name: 'player',
  },
  withProps({
    name: null as string | null,
    roomId: null as string | null,
  }),
);
