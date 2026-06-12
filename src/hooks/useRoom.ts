import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { GameState } from '../types/game';
import { PlayerState } from '../types/player';
import toast from 'react-hot-toast';

export function useRoom(roomCode?: string) {
  const { socket, connected } = useSocket();
  const [roomState, setRoomState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !connected) return;

    if (roomCode) {
      socket.emit('join-room', roomCode);
    }

    const handleRoomUpdated = (state: GameState, currentPlayers: PlayerState[]) => {
      setRoomState(state);
      setPlayers(currentPlayers);
    };

    const handleError = (msg: string) => {
      toast.error(msg);
      setError(msg);
    };

    const handleHostTransferred = ({ newHostId }: { newHostId: string }) => {
      setPlayers(prev => {
        const newPlayers = prev.map(p => ({ ...p, isHost: p.id === newHostId }));
        const newHost = newPlayers.find(p => p.id === newHostId);
        if (newHost) {
          toast.success(`${newHost.name} is now the host!`);
        }
        return newPlayers;
      });
    };

    const handlePlayerJoined = (player: PlayerState) => {
      toast.success(`${player.name} joined the room!`);
    };

    const handlePlayerLeft = (playerId: string) => {
      setPlayers(prev => {
        const player = prev.find(p => p.id === playerId);
        if (player) {
          toast(`${player.name} left the room.`, { icon: '🚪' });
        }
        return prev;
      });
    };

    const handleRoundStarted = (roundNum: number) => {
      toast(`Round ${roundNum} is starting!`, { icon: '🎮', duration: 4000 });
    };

    socket.on('room-updated', handleRoomUpdated);
    socket.on('error', handleError);
    socket.on('host-transferred', handleHostTransferred);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('round-started', handleRoundStarted);

    return () => {
      socket.off('room-updated', handleRoomUpdated);
      socket.off('error', handleError);
      socket.off('host-transferred', handleHostTransferred);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('round-started', handleRoundStarted);
    };
  }, [socket, connected, roomCode]);

  return { roomState, players, error, connected };
}
