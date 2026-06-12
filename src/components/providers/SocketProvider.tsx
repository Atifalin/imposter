'use client';

import { createContext, useEffect, useState, ReactNode, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { PlayerContext } from './PlayerProvider';
import { ClientToServerEvents, ServerToClientEvents } from '../../types/socket';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connected: boolean;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { player } = useContext(PlayerContext);

  useEffect(() => {
    const token = localStorage.getItem('playerToken');

    // Only connect once the player has authenticated (has a token). The server's
    // auth middleware rejects token-less sockets, which would otherwise cause an
    // endless "Reconnecting..." loop on pre-login pages like the landing screen.
    if (!token) {
      setSocket(null);
      setConnected(false);
      return;
    }

    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl && typeof window !== 'undefined') {
      socketUrl = window.location.origin;
    }
    
    // Extract roomCode from URL if on a room page
    let roomCode;
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/room\/([a-zA-Z0-9]+)/);
      if (match) roomCode = match[1];
    }

    const newSocket = io(socketUrl, {
      auth: { token, roomCode },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));

    return () => {
      newSocket.disconnect();
    };
  }, [player?.id]); // Reconnect if player id changes (like after login)

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
