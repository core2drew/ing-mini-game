export enum PlayerStatus {
  WAITING = 1,
  THINKING = 2,
  ANSWERED = 3,
  CORRECT = 4,
  WRONG = 5,
  OFFLINE = 6,
}

export interface UpdateStatusPayload {
  roomId: string;
  playerName: string;
  targetStatus: PlayerStatus;
  chosenAnswer?: number;
  lastQuestionBonusPoints?: number;
}
