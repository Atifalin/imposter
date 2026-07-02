'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../../hooks/useSocket';
import { DEFAULT_CATEGORIES, DIFFICULTY_LEVELS, MAX_PLAYERS } from '../../lib/constants';
import { GameState, RoomSettings } from '../../types/game';
import { usePlayer } from '../../hooks/usePlayer';

export default function CreateRoom() {
  const router = useRouter();
  const { socket } = useSocket();
  const { player, setPlayerName } = usePlayer();
  
  const [categories, setCategories] = useState<string[]>(['Bollywood Movies', 'Indian Food', 'Cricket']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [imposterCount, setImposterCount] = useState(1);
  const [discussionTimerEnabled, setDiscussionTimerEnabled] = useState(true);
  const [discussionTimerSeconds, setDiscussionTimerSeconds] = useState(120);
  const [votingTimerEnabled, setVotingTimerEnabled] = useState(true);
  const [votingTimerSeconds, setVotingTimerSeconds] = useState(60);
  const [remoteMode, setRemoteMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const handleCreate = () => {
    if (!socket || !player) return;
    
    if (categories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    setIsCreating(true);
    
    const settings: RoomSettings = {
      categories,
      difficulty,
      imposterCount,
      discussionTimerEnabled,
      discussionTimerSeconds,
      votingTimerEnabled,
      votingTimerSeconds,
      remoteMode
    };

    socket.emit('create-room', settings);

    // Listen for room-updated to get the code
    socket.once('room-updated', (state: GameState) => {
      router.push(`/room/${state.code}`);
    });
  };

  const handleNameChange = () => {
    const newName = prompt('Enter your new name:', player?.name);
    if (newName && newName.trim().length > 0) {
      setPlayerName(newName.trim());
      // The socket connection isn't typically established to a room yet here, 
      // but if it is, the backend has been updated to handle it.
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 py-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl glass-strong rounded-3xl p-6 md:p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Room Settings</h1>
            <button 
              onClick={handleNameChange}
              className="text-xs text-primary hover:text-white transition-colors underline mt-1"
            >
              Change Name ({player?.name})
            </button>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="btn-ghost text-sm"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-8">
          {/* Categories */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map(cat => {
                const isSelected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.5)] border border-primary/50' 
                        : 'bg-surface border border-white/10 text-text-muted hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            {categories.length === 0 && (
              <p className="text-danger text-sm mt-2">Select at least one category</p>
            )}
          </section>

          {/* Difficulty */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">Difficulty</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DIFFICULTY_LEVELS.map(level => {
                const isSelected = difficulty === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setDifficulty(level.id as any)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-surface-light border-accent shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                        : 'bg-surface border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-bold text-white mb-1">{level.label}</div>
                    <div className="text-xs text-text-muted">{level.description}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Imposter Count */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">Imposters</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setImposterCount(Math.max(1, imposterCount - 1))}
                className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xl hover:bg-surface-light"
              >
                -
              </button>
              <span className="text-2xl font-bold w-8 text-center">{imposterCount}</span>
              <button 
                onClick={() => setImposterCount(Math.min(Math.floor(MAX_PLAYERS/3), imposterCount + 1))}
                className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xl hover:bg-surface-light"
              >
                +
              </button>
            </div>
          </section>

          {/* Remote Mode */}
          <section>
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Remote Mode</h2>
                <p className="text-xs text-text-muted">Enable WebRTC Voice Chat and Text Chat for players not in the same room.</p>
              </div>
              <button 
                onClick={() => setRemoteMode(!remoteMode)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${remoteMode ? 'bg-success' : 'bg-surface-light'}`}
              >
                <motion.div 
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: remoteMode ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </section>

          <button
            onClick={handleCreate}
            disabled={isCreating || categories.length === 0}
            className="w-full btn-primary py-4 text-lg mt-8"
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
