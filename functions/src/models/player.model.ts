export enum PlayerStatus {
  WAITING = 1,
  THINKING = 2,
  ANSWERED = 3,
  OFFLINE = 4,
}

export interface UpdateStatusPayload {
  roomId: string;
  playerName: string;
  targetStatus: PlayerStatus; // Pass the status dynamically
}
