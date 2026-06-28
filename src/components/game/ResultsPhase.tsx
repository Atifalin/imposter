'use client';

import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../../types/game';
import { PlayerState } from '../../types/player';
import { useSocket } from '../../hooks/useSocket';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';

interface ResultsPhaseProps {
  roomState: GameState;
  players: PlayerState[];
  results: { secretWord: string; hint: string; imposters: string[] } | null;
  currentPlayerId: string;
}

export default function ResultsPhase({ roomState, players, results, currentPlayerId }: ResultsPhaseProps) {
  const { socket } = useSocket();
  const isHost = roomState.hostPlayerId === currentPlayerId;
  const [stage, setStage] = useState<'tally' | 'suspense' | 'reveal'>('tally');

  useEffect(() => {
    if (!results) return;

    // Stage 1: Tally
    const tickSound = new Audio('https://cdn.pixabay.com/download/audio/2021/08/09/audio_b200b345f1.mp3?filename=tick-tock-27513.mp3');
    tickSound.volume = 0.5;
    tickSound.play().catch(e => console.log('Audio play failed', e));

    // Stage 2: Suspense
    const timer1 = setTimeout(() => {
      setStage('suspense');
      const drumroll = new Audio('https://cdn.pixabay.com/download/audio/2022/10/30/audio_55a29cc841.mp3?filename=drum-roll-sound-effect-123490.mp3');
      drumroll.play().catch(e => console.log('Audio play failed', e));
    }, 3000);

    // Stage 3: Reveal
    const timer2 = setTimeout(() => {
      setStage('reveal');
      const stamp = new Audio('https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bceaf0.mp3?filename=punch-140236.mp3');
      stamp.play().catch(e => console.log('Audio play failed', e));
      
      // Haptics for mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      // Confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [results]);

  const handleNextRound = () => {
    if (!socket || !isHost) return;
    socket.emit('start-round');
  };

  if (!results) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full relative z-10 justify-center">
      <AnimatePresence mode="wait">
        {stage === 'tally' && (
          <motion.div 
            key="tally"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Tallying Votes...</h2>
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </motion.div>
        )}

        {stage === 'suspense' && (
          <motion.div 
            key="suspense"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl font-black text-accent neon-glow animate-pulse">
              The Imposter is...
            </h2>
          </motion.div>
        )}

        {stage === 'reveal' && (
          <motion.div 
            key="reveal"
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
            className="glass-strong rounded-3xl p-8 md:p-12 text-center"
          >
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-4">
                {results.imposters.map((name, i) => (
                  <div 
                    key={i}
                    className="bg-danger/20 border-4 border-danger text-danger px-12 py-6 rounded-2xl text-4xl md:text-6xl font-black shadow-[0_0_50px_rgba(239,68,68,0.6)] transform -rotate-2"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-text-muted uppercase tracking-widest mb-4 mt-12">The Secret Word Was</h2>
            <div className="text-5xl md:text-7xl font-black text-white mb-8 break-words" style={{ textShadow: '0 0 40px rgba(124,58,237,0.6)' }}>
              {results.secretWord}
            </div>

            <div className="bg-surface/50 rounded-2xl p-6 inline-block mb-12 border border-white/10">
              <h3 className="text-text-muted font-semibold uppercase tracking-widest text-sm mb-2">The Hint Was</h3>
              <div className="text-3xl font-bold text-accent">{results.hint}</div>
            </div>

            {isHost && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
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
        )}
      </AnimatePresence>
    </div>
  );
}
