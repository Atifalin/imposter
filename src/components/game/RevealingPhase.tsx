'use client';

import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { GameState, ClientAssignment } from '../../types/game';
import { PlayerState } from '../../types/player';
import { useSocket } from '../../hooks/useSocket';

import SimpleCard from './SimpleCard';

interface RevealingPhaseProps {
  roomState: GameState;
  players: PlayerState[];
  assignment: ClientAssignment | null;
  currentPlayerId: string;
}

export default function RevealingPhase({ roomState, players, assignment, currentPlayerId }: RevealingPhaseProps) {
  const { socket } = useSocket();
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isReady = currentPlayer?.ready;

  const readyCount = players.filter(p => p.ready).length;

  const handleCardViewed = () => {
    if (!socket || isReady) return;
    socket.emit('card-viewed');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 pb-8 max-w-4xl mx-auto w-full">
      <div className="text-center mt-8 z-10 pointer-events-none">
        <h2 className="text-3xl md:text-4xl font-black mb-2 uppercase tracking-widest text-white">Your Secret</h2>
        <p className="text-text-muted">Tap and hold the card to reveal</p>
      </div>

      <div className="flex-1 w-full flex items-center justify-center min-h-[400px]">
        {assignment ? (
          <SimpleCard 
            word={assignment.assignedWord} 
            isImposter={assignment.isImposter}
            isReady={isReady} 
            onViewed={handleCardViewed} 
          />
        ) : (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-64 h-96 bg-surface/50 rounded-2xl border border-white/5 mb-4" />
            <p className="text-text-muted">Waiting for assignment...</p>
          </div>
        )}
      </div>

      <div className="w-full mt-auto glass rounded-2xl p-6 relative overflow-hidden z-10">
        <div className="flex justify-between items-end mb-2">
          <div>
            <div className="text-sm text-text-muted font-medium mb-1 uppercase tracking-wider">Players Ready</div>
            <div className="text-3xl font-black text-white">{readyCount} <span className="text-text-muted text-xl font-medium">/ {players.length}</span></div>
          </div>
          {isReady && readyCount < players.length && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-success/20 text-success px-4 py-2 rounded-full font-bold text-sm border border-success/30 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              WAITING
            </motion.div>
          )}
          {readyCount === players.length && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {roomState.hostPlayerId === currentPlayerId ? (
                <button
                  onClick={() => socket?.emit('start-discussion')}
                  className="btn-primary py-2 px-6 font-bold"
                >
                  Start Discussion
                </button>
              ) : (
                <div className="text-text-muted font-bold animate-pulse">
                  Waiting for host...
                </div>
              )}
            </motion.div>
          )}
        </div>
        
        <div className="w-full bg-surface-light rounded-full h-3 mt-4 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-primary to-accent h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(readyCount / players.length) * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
          />
        </div>
      </div>
    </div>
  );
}
