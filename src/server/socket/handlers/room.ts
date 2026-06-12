import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../../types/socket';
import { prisma } from '../../../lib/prisma';
import { gameStateManager } from '../../game/state';
import { generateRoomCode } from '../../../lib/utils';
import { RoomSettings } from '../../../types/game';

export function registerRoomHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, never, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, never, SocketData>
) {
  const playerId = socket.data.playerId;
  const playerName = socket.data.playerName;

  socket.on('create-room', async (settings) => {
    try {
      let code = generateRoomCode();
      let isUnique = false;
      while (!isUnique) {
        const existing = await prisma.room.findUnique({ where: { code } });
        if (!existing) isUnique = true;
        else code = generateRoomCode();
      }

      const dbRoom = await prisma.room.create({
        data: {
          code,
          hostPlayerId: playerId,
          settings: JSON.stringify(settings),
          members: {
            create: { playerId }
          }
        }
      });

      const room = gameStateManager.createRoom(dbRoom.id, code, playerId, settings);
      room.players.set(playerId, { id: playerId, name: playerName, connected: true, isHost: true });

      socket.join(code);
      socket.data.roomCode = code;
      
      io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());
    } catch (e) {
      socket.emit('error', 'Failed to create room');
    }
  });

  socket.on('join-room', async (code) => {
    try {
      const room = gameStateManager.getRoom(code);
      if (!room) return socket.emit('error', 'Room not found');
      
      // Upsert room member in DB
      await prisma.roomMember.upsert({
        where: { roomId_playerId: { roomId: room.roomId, playerId } },
        update: { connected: true },
        create: { roomId: room.roomId, playerId }
      });

      room.players.set(playerId, { 
        id: playerId, 
        name: playerName, 
        connected: true, 
        isHost: room.hostPlayerId === playerId 
      });

      socket.join(code);
      socket.data.roomCode = code;
      
      io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());
      socket.to(code).emit('player-joined', room.players.get(playerId)!);
    } catch (e) {
      socket.emit('error', 'Failed to join room');
    }
  });

  socket.on('leave-room', async () => {
    const code = socket.data.roomCode;
    if (!code) return;

    try {
      const room = gameStateManager.getRoom(code);
      if (room) {
        room.players.delete(playerId);
        socket.leave(code);
        socket.data.roomCode = undefined;
        
        await prisma.roomMember.update({
          where: { roomId_playerId: { roomId: room.roomId, playerId } },
          data: { connected: false }
        });

        io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());
        io.to(code).emit('player-left', playerId);

        // Host transfer logic if host leaves
        if (room.hostPlayerId === playerId && room.players.size > 0) {
          const newHost = Array.from(room.players.values())[0];
          room.hostPlayerId = newHost.id;
          newHost.isHost = true;
          
          await prisma.room.update({
            where: { id: room.roomId },
            data: { hostPlayerId: newHost.id }
          });
          
          io.to(code).emit('host-transferred', { newHostId: newHost.id });
          io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());
        } else if (room.players.size === 0) {
          // If empty, we can clean up memory state later
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('update-settings', async (settings) => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = gameStateManager.getRoom(code);
    if (!room || room.hostPlayerId !== playerId) return;

    try {
      room.settings = settings;
      await prisma.room.update({
        where: { id: room.roomId },
        data: { settings: JSON.stringify(settings) }
      });
      io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());
    } catch (e) {
      socket.emit('error', 'Failed to update settings');
    }
  });
}
