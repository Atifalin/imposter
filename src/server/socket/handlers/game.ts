import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../../types/socket';
import { prisma } from '../../../lib/prisma';
import { gameStateManager } from '../../game/state';
import { selectWord, assignRoles } from '../../game/engine';

export function registerGameHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, never, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, never, SocketData>
) {
  const playerId = socket.data.playerId;

  socket.on('start-round', async () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = gameStateManager.getRoom(code);
    if (!room || room.hostPlayerId !== playerId) return;

    try {
      // 1. Pick Word
      const { word, hint } = await selectWord(room.settings.categories, room.usedWordIds, room.settings.difficulty);
      room.usedWordIds.push(word.id);

      // 2. Assign Roles
      const playersArray = room.getPlayersArray();
      const assignmentsMap = assignRoles(playersArray, room.settings.imposterCount);

      // 3. Create DB records
      const roundNumber = (room.currentRound?.roundNumber || 0) + 1;
      const dbRound = await prisma.round.create({
        data: {
          roomId: room.roomId,
          roundNumber,
          wordId: word.id,
          secretWord: word.word,
          hint: hint,
          difficulty: room.settings.difficulty,
          status: 'revealing'
        }
      });

      // Reset player ready state
      for (const p of room.players.values()) {
        p.ready = false;
      }

      room.currentRound = {
        id: dbRound.id,
        roundNumber,
        status: 'revealing',
        difficulty: room.settings.difficulty,
        secretWord: word.word,
        hint: hint,
        assignments: assignmentsMap,
        votes: new Map()
      };

      if (room.status === 'lobby') {
        room.status = 'playing';
        await prisma.room.update({
          where: { id: room.roomId },
          data: { status: 'playing' }
        });
      }

      // Create assignments and send directly to clients
      for (const [pId, role] of assignmentsMap.entries()) {
        const assignedWord = role === 'imposter' ? hint : word.word;
        const dbAssignment = await prisma.assignment.create({
          data: {
            roundId: dbRound.id,
            playerId: pId,
            assignedWord: assignedWord,
            isImposter: role === 'imposter',
            viewed: false
          }
        });

        // Send to specific player socket by emitting to their playerId room
        io.to(pId).emit('assignment', {
          id: dbAssignment.id,
          roundId: dbRound.id,
          playerId: pId,
          assignedWord,
          viewed: false
        });
      }

      // Tell everyone round started
      io.to(code).emit('round-started', roundNumber);
      io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());

    } catch (e) {
      socket.emit('error', 'Failed to start round');
      console.error(e);
    }
  });

  socket.on('card-viewed', async () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = gameStateManager.getRoom(code);
    if (!room || !room.currentRound) return;

    try {
      const p = room.players.get(playerId);
      if (p) p.ready = true;

      // Async DB update
      prisma.assignment.updateMany({
        where: { roundId: room.currentRound.id, playerId },
        data: { viewed: true }
      }).catch(console.error);

      io.to(code).emit('card-viewed-ack', playerId);

      // Check if all viewed
      const allReady = Array.from(room.players.values()).every(player => player.ready);
      if (allReady && room.currentRound.status === 'revealing') {
        room.currentRound.status = 'discussion';
        await prisma.round.update({
          where: { id: room.currentRound.id },
          data: { status: 'discussion' }
        });
        io.to(code).emit('all-ready');
        io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('reveal-results', async () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = gameStateManager.getRoom(code);
    if (!room || room.hostPlayerId !== playerId || !room.currentRound) return;

    room.currentRound.status = 'results';
    await prisma.round.update({
      where: { id: room.currentRound.id },
      data: { status: 'results' }
    });

    const imposters: string[] = [];
    room.currentRound.assignments.forEach((role, id) => {
      if (role === 'imposter') {
        const p = room.players.get(id);
        if (p) imposters.push(p.name);
      }
    });

    io.to(code).emit('results-revealed', {
      secretWord: room.currentRound.secretWord,
      hint: room.currentRound.hint,
      imposters
    });
    io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());
  });

  socket.on('start-voting', async () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = gameStateManager.getRoom(code);
    if (!room || room.hostPlayerId !== playerId || !room.currentRound) return;

    try {
      room.currentRound.status = 'voting';
      await prisma.round.update({
        where: { id: room.currentRound.id },
        data: { status: 'voting' }
      });

      io.to(code).emit('voting-started');
      io.to(code).emit('room-updated', room.getPublicState(), room.getPlayersArray());
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('cast-vote', async (targetId) => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = gameStateManager.getRoom(code);
    if (!room || !room.currentRound || room.currentRound.status !== 'voting') return;

    try {
      // Record vote in memory
      room.currentRound.votes.set(playerId, targetId);

      // Record vote in DB
      await prisma.vote.create({
        data: {
          roundId: room.currentRound.id,
          voterId: playerId,
          targetId: targetId
        }
      });

      // Compute vote counts to send back
      const voteCounts: { [id: string]: number } = {};
      for (const tId of Array.from(room.currentRound.votes.values())) {
        voteCounts[tId] = (voteCounts[tId] || 0) + 1;
      }

      io.to(code).emit('vote-update', voteCounts);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('request-assignment', async () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = gameStateManager.getRoom(code);
    if (!room || !room.currentRound) return;

    try {
      const assignment = await prisma.assignment.findFirst({
        where: { roundId: room.currentRound.id, playerId }
      });
      if (assignment) {
        socket.emit('assignment', {
          id: assignment.id,
          roundId: assignment.roundId,
          playerId: assignment.playerId,
          assignedWord: assignment.assignedWord,
          viewed: assignment.viewed
        });
      }
    } catch (e) {
      console.error(e);
    }
  });
}
