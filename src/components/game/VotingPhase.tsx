'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../../types/game';
import { PlayerState } from '../../types/player';
import { useSocket } from '../../hooks/useSocket';

interface VotingPhaseProps {
  roomState: GameState;
  players: PlayerState[];
  votes: { [targetId: string]: number };
  timer: number | null;
  currentPlayerId: string;
}

export default function VotingPhase({ roomState, players, votes, timer, currentPlayerId }: VotingPhaseProps) {
  const { socket } = useSocket();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  
  const isHost = roomState.hostPlayerId === currentPlayerId;
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const handleVote = () => {
    if (!socket || !selectedPlayerId || hasVoted) return;
    socket.emit('cast-vote', selectedPlayerId);
    setHasVoted(true);
  };

  const handleRevealResults = () => {
    if (!socket || !isHost) return;
    socket.emit('reveal-results');
  };

  const eligiblePlayers = players.filter(p => p.id !== currentPlayerId);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-widest text-danger neon-glow">
          Vote
        </h2>
        <p className="text-xl text-text-muted">Who is the imposter?</p>
      </div>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start mb-8">
        {eligiblePlayers.map((p, i) => {
          const isSelected = selectedPlayerId === p.id;
          const voteCount = votes[p.id] || 0;
          
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => !hasVoted && setSelectedPlayerId(p.id)}
              disabled={hasVoted}
              className={`relative glass p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 ${
                isSelected ? 'ring-4 ring-danger shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-105 bg-surface/80' : 
                hasVoted ? 'opacity-50 grayscale' : 'hover:bg-surface/60 hover:scale-105'
              }`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner ${
                isSelected ? 'bg-danger text-white' : 'bg-surface-light border border-white/10 text-white'
              }`}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="font-bold text-xl text-white w-full truncate px-2">{p.name}</div>
              
              {hasVoted && (
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-light border-2 border-white text-white font-bold flex items-center justify-center">
                  {voteCount}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="glass-strong p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-text-muted font-bold tracking-widest uppercase mb-1">Votes Cast</div>
          <div className="text-3xl font-black text-white">{totalVotes} <span className="text-text-muted text-xl">/ {players.length}</span></div>
        </div>
        
        {!hasVoted ? (
          <button
            onClick={handleVote}
            disabled={!selectedPlayerId}
            className="w-full md:w-auto btn-primary py-4 px-12 text-xl"
          >
            Submit Vote
          </button>
        ) : (
          <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
            <div className="text-success font-bold text-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Vote Submitted
            </div>
            {isHost && (
              <button
                onClick={handleRevealResults}
                className="btn-secondary w-full"
              >
                Reveal Results Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
