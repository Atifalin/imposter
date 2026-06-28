'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { usePlayer } from '../../../hooks/usePlayer';
import { useSocket } from '../../../hooks/useSocket';
import { NameInput } from '../../../components/ui/NameInput';
import { MadeBy } from '../../../components/ui/MadeBy';

export default function JoinRoom() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { player, loading: playerLoading, createPlayer, setPlayerName } = usePlayer();
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
    // We no longer auto-join so the user has a chance to change their name.
    // They must click the 'Join Room' button.
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-3xl p-8 flex flex-col items-center max-w-sm w-full relative"
        >
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">
            {isJoining ? 'Joining Room...' : 'Loading Room...'}
          </h2>
          <p className="text-text-muted text-center text-sm">
            {isJoining ? 'Connecting to server...' : 'Fetching details...'}
          </p>
        </motion.div>
        <MadeBy />
      </div>
    );
  }

  const handleNameChange = () => {
    const newName = prompt('Enter your new name:', player?.name);
    if (newName && newName.trim().length > 0) {
      setPlayerName(newName.trim());
    }
  };

  // Player needs to enter name
  if (!player) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto min-h-0">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Joining Room <span className="text-primary">{code}</span></h2>
          <p className="text-text-muted">{roomInfo.playerCount} players waiting</p>
        </div>
        <NameInput onSubmit={createPlayer} />
      </div>
    );
  }

  // If player exists but hasn't started joining yet (or is paused before joining)
  // Actually, handleJoin is called immediately in useEffect if player exists.
  // If the user wants a chance to change their name BEFORE joining, we need to remove the auto-join,
  // or just let them change it in the lobby. The user specifically asked for "Change Name on join room page".
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-y-auto min-h-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass-strong rounded-3xl p-8 flex flex-col items-center text-center"
      >
        <h2 className="text-3xl font-bold mb-2">Joining Room</h2>
        <h1 className="text-5xl font-black text-primary tracking-widest mb-4">{code}</h1>
        <p className="text-text-muted mb-8">{roomInfo.playerCount} players waiting</p>
        
        <div className="w-full bg-surface/50 rounded-2xl p-4 mb-8 border border-white/5">
          <p className="text-sm text-text-muted mb-1">Joining as</p>
          <p className="text-xl font-bold text-white mb-2">{player.name}</p>
          <button 
            onClick={handleNameChange}
            className="text-xs text-primary hover:text-white transition-colors underline"
          >
            Change Name
          </button>
        </div>

        <button 
          onClick={handleJoin}
          className="btn-primary w-full py-4 text-lg"
        >
          Join Room
        </button>
      </motion.div>
    </div>
  );
}
