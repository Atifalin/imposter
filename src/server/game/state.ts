import { GameState, RoomSettings } from '../../types/game';
import { PlayerState } from '../../types/player';
import { prisma } from '../../lib/prisma';
import { selectWord, assignRoles } from './engine';
import { v4 as uuidv4 } from 'uuid';

export class RoomState {
  roomId: string;
  code: string;
  hostPlayerId: string;
  status: 'lobby' | 'playing' | 'finished' = 'lobby';
  settings: RoomSettings;
  players: Map<string, PlayerState> = new Map();
  usedWordIds: string[] = [];
  
  // Game round state
  currentRound?: {
    id: string;
    roundNumber: number;
    status: 'revealing' | 'discussion' | 'voting' | 'results';
    difficulty: string;
    secretWord: string; // Server only
    hint: string;       // Server only
    assignments: Map<string, 'imposter' | 'crew'>; // Server only
    votes: Map<string, string>; // voterId -> targetId
  };

  constructor(roomId: string, code: string, hostPlayerId: string, settings: RoomSettings) {
    this.roomId = roomId;
    this.code = code;
    this.hostPlayerId = hostPlayerId;
    this.settings = settings;
  }

  getPublicState(): GameState {
    return {
      roomId: this.roomId,
      code: this.code,
      hostPlayerId: this.hostPlayerId,
      status: this.status,
      settings: this.settings,
      currentRound: this.currentRound ? {
        id: this.currentRound.id,
        roundNumber: this.currentRound.roundNumber,
        status: this.currentRound.status,
        difficulty: this.currentRound.difficulty
      } : undefined
    };
  }

  getPlayersArray(): PlayerState[] {
    return Array.from(this.players.values());
  }
}

export class GameStateManager {
  private rooms: Map<string, RoomState> = new Map();

  createRoom(roomId: string, code: string, hostPlayerId: string, settings: RoomSettings): RoomState {
    const room = new RoomState(roomId, code, hostPlayerId, settings);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): RoomState | undefined {
    return this.rooms.get(code);
  }

  deleteRoom(code: string) {
    this.rooms.delete(code);
  }

  // Restore active rooms from DB (useful for server restarts)
  async restoreFromDB() {
    const dbRooms = await prisma.room.findMany({
      where: { status: { in: ['lobby', 'playing'] } },
      include: {
        members: { include: { player: true } },
        rounds: { orderBy: { roundNumber: 'desc' }, take: 1, include: { assignments: true } }
      }
    });

    for (const dbRoom of dbRooms) {
      const room = new RoomState(dbRoom.id, dbRoom.code, dbRoom.hostPlayerId, typeof dbRoom.settings === 'string' ? JSON.parse(dbRoom.settings) : dbRoom.settings);
      room.status = dbRoom.status as any;
      
      for (const member of dbRoom.members) {
        room.players.set(member.playerId, {
          id: member.player.id,
          name: member.player.name,
          connected: member.connected,
          isHost: member.playerId === dbRoom.hostPlayerId
        });
      }

      if (dbRoom.rounds.length > 0) {
        const round = dbRoom.rounds[0];
        const assignments = new Map<string, 'imposter' | 'crew'>();
        round.assignments.forEach(a => assignments.set(a.playerId, a.isImposter ? 'imposter' : 'crew'));
        
        room.currentRound = {
          id: round.id,
          roundNumber: round.roundNumber,
          status: round.status as any,
          difficulty: round.difficulty,
          secretWord: round.secretWord,
          hint: round.hint,
          assignments,
          votes: new Map()
        };
      }
      this.rooms.set(room.code, room);
    }
  }
}

export const gameStateManager = new GameStateManager();
