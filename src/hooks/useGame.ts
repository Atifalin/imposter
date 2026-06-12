import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { ClientAssignment } from '../types/game';

interface ResultsData {
  secretWord: string;
  hint: string;
  imposters: string[];
}

export function useGame() {
  const { socket } = useSocket();
  const [assignment, setAssignment] = useState<ClientAssignment | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [votes, setVotes] = useState<{ [targetId: string]: number }>({});
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleAssignment = (data: ClientAssignment) => {
      setAssignment(data);
      setResults(null);
    };

    const handleResultsRevealed = (data: ResultsData) => {
      setResults(data);
    };

    const handleVoteUpdate = (newVotes: { [targetId: string]: number }) => {
      setVotes(newVotes);
    };

    const handleTimerTick = (seconds: number) => {
      setTimer(seconds);
    };

    socket.on('assignment', handleAssignment);
    socket.on('results-revealed', handleResultsRevealed);
    socket.on('vote-update', handleVoteUpdate);
    socket.on('timer-tick', handleTimerTick);

    return () => {
      socket.off('assignment', handleAssignment);
      socket.off('results-revealed', handleResultsRevealed);
      socket.off('vote-update', handleVoteUpdate);
      socket.off('timer-tick', handleTimerTick);
    };
  }, [socket]);

  return { assignment, results, votes, timer };
}
