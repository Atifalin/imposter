// ========== Player Types ==========

export interface Player {
  id: string;
  name: string;
  token: string;
}

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  hasViewedCard: boolean;
  hasVoted: boolean;
}

// ========== Room Types ==========

export type GamePhase = 'lobby' | 'revealing' | 'discussion' | 'voting' | 'results';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RoomSettings {
  categories: string[];
  difficulty: Difficulty;
  imposterCount: number;
  timerEnabled: boolean;
  timerDuration: number; // seconds
  maxPlayers: number;
}

export interface Room {
  code: string;
  hostId: string;
  players: RoomPlayer[];
  settings: RoomSettings;
  phase: GamePhase;
  round: number;
  createdAt: string;
}

// ========== Game Types ==========

export interface GameAssignment {
  word: string | null; // null = you're the imposter
  hint: string;
  isImposter: boolean;
  category: string;
}

export interface VoteResult {
  voterId: string;
  votedForId: string;
}

export interface GameResults {
  secretWord: string;
  hint: string;
  category: string;
  imposters: string[]; // player IDs
  votes: VoteResult[];
  impostersCaught: boolean;
}

// ========== Socket Event Types ==========

export interface ServerToClientEvents {
  'room:updated': (room: Room) => void;
  'room:error': (error: { message: string }) => void;
  'game:assignment': (assignment: GameAssignment) => void;
  'game:phase-changed': (data: { phase: GamePhase; round?: number }) => void;
  'game:results': (results: GameResults) => void;
  'game:timer-tick': (data: { remaining: number }) => void;
  'player:joined': (player: RoomPlayer) => void;
  'player:left': (data: { playerId: string }) => void;
  'player:removed': (data: { playerId: string; reason: string }) => void;
  'connection:status': (data: { status: string }) => void;
}

export interface ClientToServerEvents {
  'room:create': (data: { settings: Partial<RoomSettings> }, callback: (response: { ok: boolean; room?: Room; error?: string }) => void) => void;
  'room:join': (data: { code: string }, callback: (response: { ok: boolean; room?: Room; error?: string }) => void) => void;
  'room:leave': (data: { code: string }) => void;
  'room:update-settings': (data: { code: string; settings: Partial<RoomSettings> }) => void;
  'room:remove-player': (data: { code: string; playerId: string }) => void;
  'game:start': (data: { code: string }, callback: (response: { ok: boolean; error?: string }) => void) => void;
  'game:card-viewed': (data: { code: string }) => void;
  'game:start-voting': (data: { code: string }) => void;
  'game:vote': (data: { code: string; votedForId: string }, callback: (response: { ok: boolean; error?: string }) => void) => void;
  'game:next-round': (data: { code: string }) => void;
  'game:new-game': (data: { code: string }) => void;
}

// ========== API Types ==========

export interface CreatePlayerRequest {
  name: string;
}

export interface CreatePlayerResponse {
  id: string;
  name: string;
  token: string;
}

export interface RoomPreview {
  code: string;
  playerCount: number;
  maxPlayers: number;
  hostName: string;
  phase: GamePhase;
  categories: string[];
}

// ========== Category ==========

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'animals', name: 'Animals', icon: '🐾' },
  { id: 'food', name: 'Food & Drink', icon: '🍕' },
  { id: 'movies', name: 'Movies & TV', icon: '🎬' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'places', name: 'Places', icon: '🌍' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'history', name: 'History', icon: '📜' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'games', name: 'Games', icon: '🎮' },
];

// ========== Avatar Colors ==========

export const AVATAR_COLORS = [
  '#7C3AED', '#EC4899', '#60A5FA', '#22C55E',
  '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6',
  '#F472B6', '#34D399', '#FBBF24', '#FB923C',
];

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
