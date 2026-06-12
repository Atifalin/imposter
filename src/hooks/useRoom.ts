import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { GameState } from '../types/game';
import { PlayerState } from '../types/player';

export function useRoom(roomCode?: string) {
  const { socket, connected } = useSocket();
  const [roomState, setRoomState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useRoom effect:', { socket: !!socket, connected, roomCode });
    if (!socket || !connected) return;

    if (roomCode) {
      console.log('Emitting join-room for', roomCode);
      socket.emit('join-room', roomCode);
    }

    const handleRoomUpdated = (state: GameState, currentPlayers: PlayerState[]) => {
      console.log('Received room-updated:', state.code);
      setRoomState(state);
      setPlayers(currentPlayers);
    };

    const handleError = (msg: string) => {
      console.error('Room error:', msg);
      setError(msg);
    };

    const handleHostTransferred = ({ newHostId }: { newHostId: string }) => {
      setPlayers(prev => prev.map(p => ({
        ...p,
        isHost: p.id === newHostId
      })));
    };

    socket.on('room-updated', handleRoomUpdated);
    socket.on('error', handleError);
    socket.on('host-transferred', handleHostTransferred);

    return () => {
      socket.off('room-updated', handleRoomUpdated);
      socket.off('error', handleError);
      socket.off('host-transferred', handleHostTransferred);
    };
  }, [socket, connected, roomCode]);

  return { roomState, players, error, connected };
}
