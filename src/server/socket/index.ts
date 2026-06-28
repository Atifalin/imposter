import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../types/socket';
import { prisma } from '../../lib/prisma';
import { registerRoomHandlers } from './handlers/room';
import { registerGameHandlers } from './handlers/game';
import { registerConnectionHandlers } from './handlers/connection';
import { gameStateManager } from '../game/state';

// In-memory token cache to avoid DB lookups on every reconnection
const tokenCache = new Map<string, { id: string; name: string; cachedAt: number }>();
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedPlayer(token: string) {
  const cached = tokenCache.get(token);
  if (cached && Date.now() - cached.cachedAt < TOKEN_CACHE_TTL) {
    return cached;
  }
  tokenCache.delete(token);
  return null;
}

export function registerSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents, never, SocketData>) {
  // Load state from DB
  gameStateManager.restoreFromDB().catch(console.error);

  // Authentication Middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: No token provided'));

    try {
      // Check cache first
      const cached = getCachedPlayer(token);
      if (cached) {
        socket.data.playerId = cached.id;
        socket.data.playerName = cached.name;
        socket.data.roomCode = socket.handshake.auth.roomCode;
        
        // Fire-and-forget lastSeen update
        prisma.player.update({
          where: { id: cached.id },
          data: { lastSeen: new Date() }
        }).catch(() => {});
        
        return next();
      }

      // Cache miss: single query that finds + updates lastSeen
      const player = await prisma.player.update({
        where: { token },
        data: { lastSeen: new Date() }
      });

      // Cache the result
      tokenCache.set(token, { id: player.id, name: player.name, cachedAt: Date.now() });

      socket.data.playerId = player.id;
      socket.data.playerName = player.name;
      socket.data.roomCode = socket.handshake.auth.roomCode;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    registerConnectionHandlers(io, socket);
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
  });
}
