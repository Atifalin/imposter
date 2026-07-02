export interface RoomSettings {
  categories: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  imposterCount: number;
  discussionTimerEnabled?: boolean;
  discussionTimerSeconds?: number;
  votingTimerEnabled?: boolean;
  votingTimerSeconds?: number;
  remoteMode?: boolean;
}

export interface ClientAssignment {
  id: string;
  roundId: string;
  playerId: string;
  assignedWord: string; // The word or hint
  isImposter: boolean;
  viewed: boolean;
}

export interface GameState {
  roomId: string;
  code: string;
  hostPlayerId: string;
  status: 'lobby' | 'playing' | 'finished';
  settings: RoomSettings;
  currentRound?: {
    id: string;
    roundNumber: number;
    status: 'revealing' | 'discussion' | 'voting' | 'results';
    difficulty: string;
  };
}
