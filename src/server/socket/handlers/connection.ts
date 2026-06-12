import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../../types/socket';
import { prisma } from '../../../lib/prisma';
import { gameStateManager } from '../../game/state';
import { HOST_TRANSFER_TIMEOUT } from '../../../lib/constants';

const disconnectTimers = new Map<string, NodeJS.Timeout>();

export function registerConnectionHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, never, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, never, SocketData>
) {
  const playerId = socket.data.playerId;

  // Join personal room for targeted messages (like assignments)
  socket.join(playerId);

  // On reconnect, clear any disconnect timer
  if (disconnectTimers.has(playerId)) {
    clearTimeout(disconnectTimers.get(playerId)!);
    disconnectTimers.delete(playerId);
  }

  socket.on('disconnect', async (reason) => {
    // console.log(`Player disconnected: ${socket.data.playerName} (${socket.id}) - Reason: ${reason}`);
    
    const code = socket.data.roomCode;
    if (!code) return;

    const room = gameStateManager.getRoom(code);
    if (!room) return;

    try {
      const p = room.players.get(playerId);
      if (p) p.connected = false;

      // Update DB
      await prisma.roomMember.update({
        where: { roomId_playerId: { roomId: room.roomId, playerId } },
        data: { connected: false }
      });

      io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());

      // If host disconnected, set a timer for host transfer
      if (room.hostPlayerId === playerId) {
        const timer = setTimeout(async () => {
          const currentRoom = gameStateManager.getRoom(code);
          if (!currentRoom) return;

          // Find first connected player
          const newHost = Array.from(currentRoom.players.values()).find(p => p.connected && p.id !== playerId);
          if (newHost) {
            currentRoom.hostPlayerId = newHost.id;
            const oldHost = currentRoom.players.get(playerId);
            if (oldHost) oldHost.isHost = false;
            newHost.isHost = true;

            await prisma.room.update({
              where: { id: currentRoom.roomId },
              data: { hostPlayerId: newHost.id }
            });

            io.to(code).emit('host-transferred', { newHostId: newHost.id });
            io.to(code).emit('room-updated', currentRoom.getPublicState(), currentRoom.getPlayersArray());
          }
        }, HOST_TRANSFER_TIMEOUT);
        
        disconnectTimers.set(playerId, timer);
      }
    } catch (e) {
      console.error(e);
    }
  });
}
