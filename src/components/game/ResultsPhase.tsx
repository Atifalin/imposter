'use client';

import { motion } from 'motion/react';
import { GameState } from '../../types/game';
import { PlayerState } from '../../types/player';
import { useSocket } from '../../hooks/useSocket';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ResultsPhaseProps {
  roomState: GameState;
  players: PlayerState[];
  results: { secretWord: string; hint: string; imposters: string[] } | null;
  currentPlayerId: string;
}

export default function ResultsPhase({ roomState, players, results, currentPlayerId }: ResultsPhaseProps) {
  const { socket } = useSocket();
  const isHost = roomState.hostPlayerId === currentPlayerId;

  useEffect(() => {
    if (results) {
      // Trigger confetti on mount
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [results]);

  const handleNextRound = () => {
    if (!socket || !isHost) return;
    socket.emit('start-round');
  };

  const handleBackToLobby = () => {
    // If we wanted to go back to lobby, would need a socket event for it
    // For now, we can just start a new round or close room
  };

  if (!results) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full relative z-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-3xl p-8 md:p-12 text-center"
      >
        <h2 className="text-2xl font-bold text-text-muted uppercase tracking-widest mb-4">The Secret Word Was</h2>
        <div className="text-6xl md:text-8xl font-black text-white mb-8 break-words" style={{ textShadow: '0 0 40px rgba(124,58,237,0.6)' }}>
          {results.secretWord}
        </div>

        <div className="bg-surface/50 rounded-2xl p-6 inline-block mb-12 border border-white/10">
          <h3 className="text-text-muted font-semibold uppercase tracking-widest text-sm mb-2">The Hint Was</h3>
          <div className="text-3xl font-bold text-accent">{results.hint}</div>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-text-muted uppercase tracking-widest mb-6">The Imposter{results.imposters.length > 1 ? 's' : ''}</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {results.imposters.map((name, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="bg-danger/20 border border-danger/50 text-danger px-8 py-4 rounded-full text-2xl font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>

        {isHost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          >
            <button 
              onClick={handleNextRound}
              className="btn-primary py-4 px-12 text-xl"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
