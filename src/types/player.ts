export interface PlayerState {
  id: string;
  name: string;
  connected: boolean;
  isHost?: boolean;
  socketId?: string;
  ready?: boolean; // For tracking if they've viewed their card
}
