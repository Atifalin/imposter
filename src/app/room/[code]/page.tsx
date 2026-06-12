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

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { player } = usePlayer();
  const { roomState, players, error, connected } = useRoom(code);
  const { assignment, results, timer, votes } = useGame();

  // If not logged in, redirect to join which handles name collection
  useEffect(() => {
    if (!player) {
      router.replace(`/join/${code}`);
    }
  }, [player, code, router]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <div className="glass-strong p-8 rounded-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-danger mb-4">Error</h2>
          <p className="text-white mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="btn-secondary w-full">Leave Room</button>
        </div>
      </div>
    );
  }

  if (!roomState || !player) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Routing based on game status
  if (roomState.status === 'lobby') {
    return <Lobby roomState={roomState} players={players} currentPlayerId={player.id} />;
  }

  const phase = roomState.currentRound?.status;

  switch (phase) {
    case 'revealing':
      return <RevealingPhase roomState={roomState} players={players} assignment={assignment} currentPlayerId={player.id} />;
    case 'discussion':
      return <DiscussionPhase roomState={roomState} players={players} timer={timer} currentPlayerId={player.id} />;
    case 'voting':
      return <VotingPhase roomState={roomState} players={players} votes={votes} timer={timer} currentPlayerId={player.id} />;
    case 'results':
      return <ResultsPhase roomState={roomState} players={players} results={results} currentPlayerId={player.id} />;
    default:
      return <div>Unknown game phase</div>;
  }
}
