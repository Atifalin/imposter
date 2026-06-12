'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { usePlayer } from '../../../hooks/usePlayer';
import { useSocket } from '../../../hooks/useSocket';
import { NameInput } from '../../../components/ui/NameInput';

export default function JoinRoom() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { player, loading: playerLoading, createPlayer } = usePlayer();
  const { socket } = useSocket();
  
  const [roomInfo, setRoomInfo] = useState<{ status: string; playerCount: number } | null>(null);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Fetch room preview
    fetch(`/api/room/${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setRoomInfo(data);
        }
      })
      .catch(() => setError('Failed to connect to server'));
  }, [code]);

  const handleJoin = () => {
    if (!socket || !player) return;
    setIsJoining(true);
    
    socket.emit('join-room', code);
    
    socket.once('room-updated', () => {
      router.replace(`/room/${code}`);
    });
    
    socket.once('error', (msg: string) => {
      setError(msg);
      setIsJoining(false);
    });
  };

  useEffect(() => {
    // If player exists and room exists, auto-join
    if (!playerLoading && player && roomInfo && !error && socket) {
      handleJoin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerLoading, player, roomInfo, error, socket]);



  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-strong p-8 rounded-2xl text-center max-w-sm w-full">
          <div className="text-danger text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Room Not Found</h2>
          <p className="text-text-muted mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="btn-secondary w-full">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (playerLoading || !roomInfo || isJoining) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full mb-4"
        />
        <p className="text-text-muted animate-pulse">
          {isJoining ? 'Joining room...' : 'Loading room info...'}
        </p>
      </div>
    );
  }

  // Player needs to enter name
  if (!player) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Joining Room <span className="text-primary">{code}</span></h2>
          <p className="text-text-muted">{roomInfo.playerCount} players waiting</p>
        </div>
        <NameInput onSubmit={createPlayer} />
      </div>
    );
  }

  return null; // Will auto-join due to useEffect
}
