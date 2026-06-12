import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../types/socket';
import { prisma } from '../../lib/prisma';
import { registerRoomHandlers } from './handlers/room';
import { registerGameHandlers } from './handlers/game';
import { registerConnectionHandlers } from './handlers/connection';
import { gameStateManager } from '../game/state';

export function registerSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents, never, SocketData>) {
  // Load state from DB
  gameStateManager.restoreFromDB().catch(console.error);

  // Authentication Middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: No token provided'));

    try {
      const player = await prisma.player.findUnique({ where: { token } });
      if (!player) return next(new Error('Authentication error: Invalid token'));

      socket.data.playerId = player.id;
      socket.data.playerName = player.name;
      socket.data.roomCode = socket.handshake.auth.roomCode;
      
      // Update last seen
      await prisma.player.update({
        where: { id: player.id },
        data: { lastSeen: new Date() }
      });
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // console.log(`Player connected: ${socket.data.playerName} (${socket.id})`);
    
    registerConnectionHandlers(io, socket);
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
  });
}
