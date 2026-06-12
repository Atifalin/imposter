'use client';

import { motion } from 'motion/react';
import { GameState } from '../../types/game';
import { PlayerState } from '../../types/player';
import { useSocket } from '../../hooks/useSocket';

interface DiscussionPhaseProps {
  roomState: GameState;
  players: PlayerState[];
  timer: number | null;
  currentPlayerId: string;
}

export default function DiscussionPhase({ roomState, players, timer, currentPlayerId }: DiscussionPhaseProps) {
  const { socket } = useSocket();
  const isHost = roomState.hostPlayerId === currentPlayerId;

  const handleStartVoting = () => {
    if (!socket || !isHost) return;
    socket.emit('start-voting'); // Note: Need to implement this socket handler
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-widest text-white neon-glow">
          Round {roomState.currentRound?.roundNumber}
        </h2>
        <div className="inline-block glass px-8 py-3 rounded-full text-xl font-bold text-accent shadow-[0_0_15px_rgba(236,72,153,0.3)]">
          Discussion Time
        </div>
      </div>

      {timer !== null && (
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full glass-strong">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64" cy="64" r="58"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
              />
              <circle
                cx="64" cy="64" r="58"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="6"
                strokeDasharray="364"
                strokeDashoffset={364 - (timer / (roomState.settings.timerSeconds || 120)) * 364}
                className="transition-all duration-1000 linear"
              />
            </svg>
            <span className="text-3xl font-black text-white">{formatTime(timer)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1 content-start">
        {players.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 relative ${
              !p.connected ? 'opacity-50' : ''
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-inner ${
              p.id === currentPlayerId ? 'bg-primary border-2 border-primary-light' : 'bg-surface-light border border-white/10'
            }`}>
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg text-white">{p.name}</div>
              {p.id === currentPlayerId && <div className="text-xs text-primary font-bold">YOU</div>}
            </div>
          </motion.div>
        ))}
      </div>

      {isHost ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center"
        >
          <button 
            onClick={handleStartVoting}
            className="btn-primary py-4 px-12 text-xl shadow-[0_0_30px_rgba(124,58,237,0.4)]"
          >
            Start Voting
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center text-center"
        >
          <div className="glass px-8 py-4 rounded-2xl text-text-muted font-medium animate-pulse">
            Waiting for the host to start voting...
          </div>
        </motion.div>
      )}
    </div>
  );
}
