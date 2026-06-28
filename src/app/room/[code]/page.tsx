'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoom } from '../../../hooks/useRoom';
import { useGame } from '../../../hooks/useGame';
import { usePlayer } from '../../../hooks/usePlayer';
import Lobby from '../../../components/room/Lobby';
import RevealingPhase from '../../../components/game/RevealingPhase';
import DiscussionPhase from '../../../components/game/DiscussionPhase';
import VotingPhase from '../../../components/game/VotingPhase';
import ResultsPhase from '../../../components/game/ResultsPhase';
import { MadeBy } from '../../../components/ui/MadeBy';
import { useSocket } from '../../../hooks/useSocket';
import { AnimatePresence, motion } from 'motion/react';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { player, loading: playerLoading } = usePlayer();
  const { roomState, players, error, connected } = useRoom(code);
  const { assignment, results, timer, votes, voters } = useGame();
  const { socket } = useSocket();

  // If not logged in, redirect to join which handles name collection
  useEffect(() => {
    if (!player && !playerLoading) {
      router.replace(`/join/${code}`);
    }
  }, [player, playerLoading, code, router]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center">
          <div className="text-danger mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Room Error</h2>
          <p className="text-text-muted mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="btn-primary w-full py-3">Return Home</button>
        </div>
      </div>
    );
  }

  if (!roomState || !player) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <MadeBy />
      </div>
    );
  }

  // Routing based on game status
  if (roomState.status === 'lobby') {
    return <Lobby roomState={roomState} players={players} currentPlayerId={player.id} />;
  }

  const phase = roomState.currentRound?.status;

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    router.push('/');
  };

  const renderPhase = () => {
    switch (phase) {
      case 'revealing':
        return <RevealingPhase roomState={roomState} players={players} assignment={assignment} currentPlayerId={player.id} />;
      case 'discussion':
        return <DiscussionPhase roomState={roomState} players={players} timer={timer} currentPlayerId={player.id} />;
      case 'voting':
        return <VotingPhase roomState={roomState} players={players} votes={votes} voters={voters} timer={timer} currentPlayerId={player.id} />;
      case 'results':
        return <ResultsPhase roomState={roomState} players={players} results={results} currentPlayerId={player.id} />;
      default:
        return <div>Unknown game phase</div>;
    }
  };

  return (
    <>
      <button 
        onClick={handleLeaveRoom}
        className="fixed top-4 right-4 z-50 bg-surface/80 hover:bg-danger/20 border border-white/5 hover:border-danger/30 text-text-muted hover:text-danger p-3 rounded-full backdrop-blur-sm transition-all shadow-lg"
        title="Leave Room"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={phase || 'lobby'}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0 }}
          className="flex-1 flex flex-col w-full h-full"
        >
          {renderPhase()}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
