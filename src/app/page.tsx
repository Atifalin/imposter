'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { usePlayer } from '../hooks/usePlayer';
import { NameInput } from '../components/ui/NameInput';

import { MadeBy } from '../components/ui/MadeBy';

export default function Home() {
  const router = useRouter();
  const { player, loading, createPlayer } = usePlayer();
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full mb-4"
        />
        <MadeBy />
      </div>
    );
  }

  const handleCreateRoom = async () => {
    // Navigate to a holding page or directly create room via API/socket
    // For now, let's navigate to a "create" page or open a modal
    router.push('/create'); // We will implement room creation
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 5) {
      router.push(`/join/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
          <span className="text-white">Ezy</span>
          <span className="neon-text">Imposter</span>
        </h1>
        <p className="text-lg text-text-muted font-medium">Can you spot the imposter?</p>
      </motion.div>

      <div className="z-10 w-full max-w-md">
        {!player ? (
          <NameInput onSubmit={createPlayer} isLoading={isCreating} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <p className="text-xl">Welcome back, <span className="font-bold text-primary">{player.name}</span>!</p>
            </div>

            <div className="grid gap-4">
              <button 
                onClick={handleCreateRoom}
                className="w-full btn-primary py-4 text-lg"
              >
                Create Room
              </button>

              {!showJoinInput ? (
                <button 
                  onClick={() => setShowJoinInput(true)}
                  className="w-full btn-secondary py-4 text-lg"
                >
                  Join Room
                </button>
              ) : (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleJoinSubmit}
                  className="glass-strong p-4 rounded-2xl flex gap-2"
                >
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    maxLength={5}
                    className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-bold tracking-[0.2em] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    disabled={joinCode.length !== 5}
                    className="btn-accent px-6 rounded-xl font-bold disabled:opacity-50"
                  >
                    Go
                  </button>
                </motion.form>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
