import { GameState, ClientAssignment, RoomSettings } from './game';
import { PlayerState } from './player';

export interface ServerToClientEvents {
  'room-updated': (state: GameState, players: PlayerState[]) => void;
  'game-started': () => void;
  'assignment': (assignment: ClientAssignment) => void;
  'card-viewed-ack': (playerId: string) => void;
  'all-ready': () => void;
  'results-revealed': (data: { secretWord: string; hint: string; imposters: string[] }) => void;
  'vote-update': (votes: { [targetId: string]: number }) => void;
  'player-joined': (player: PlayerState) => void;
  'player-left': (playerId: string) => void;
  'host-transferred': (data: { newHostId: string }) => void;
  'error': (message: string) => void;
  'timer-tick': (seconds: number) => void;
  'voting-started': () => void;
  'round-started': (roundNumber: number) => void;
}

export interface ClientToServerEvents {
  'create-room': (settings: RoomSettings) => void;
  'join-room': (code: string) => void;
  'leave-room': () => void;
  'change-name': (newName: string) => void;
  'update-settings': (settings: RoomSettings) => void;
  'start-round': () => void;
  'start-discussion': () => void;
  'start-voting': () => void;
  'card-viewed': () => void;
  'reveal-results': () => void;
  'next-round': () => void;
  'cast-vote': (targetId: string) => void;
  'remove-player': (playerId: string) => void;
  'close-room': () => void;
  'request-assignment': () => void;
}

export interface SocketData {
  playerId: string;
  playerName: string;
  roomCode?: string;
}
