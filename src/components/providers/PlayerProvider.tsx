'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { PlayerState } from '../../types/player';

interface PlayerContextType {
  player: PlayerState | null;
  loading: boolean;
  createPlayer: (name: string) => Promise<void>;
  setPlayerName: (name: string) => void;
  logout: () => void;
}

export const PlayerContext = createContext<PlayerContextType>({
  player: null,
  loading: true,
  createPlayer: async () => {},
  setPlayerName: () => {},
  logout: () => {}
});

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('playerToken');
    if (token) {
      fetch('/api/player', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setPlayer({ id: data.id, name: data.name, connected: true });
        } else {
          localStorage.removeItem('playerToken');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, []);

  const createPlayer = async (name: string) => {
    const res = await fetch('/api/player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('playerToken', data.token);
      setPlayer({ id: data.id, name: data.name, connected: true });
    }
  };

  const logout = () => {
    localStorage.removeItem('playerToken');
    setPlayer(null);
  };

  const setPlayerName = async (name: string) => {
    if (player) {
      setPlayer({ ...player, name });
      const token = localStorage.getItem('playerToken');
      if (token) {
        try {
          await fetch('/api/player', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
          });
        } catch (e) {
          console.error('Failed to save new name to db', e);
        }
      }
    }
  };

  return (
    <PlayerContext.Provider value={{ player, loading, createPlayer, setPlayerName, logout }}>
      {children}
    </PlayerContext.Provider>
  );
}
