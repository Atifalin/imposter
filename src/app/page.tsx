'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { usePlayer } from '../hooks/usePlayer';
import { NameInput } from '../components/ui/NameInput';

import { MadeBy } from '../components/ui/MadeBy';

export default function Home() {
  const router = useRouter();
  const { player, loading, createPlayer, setPlayerName } = usePlayer();
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

  const handleNameChange = () => {
    const newName = prompt('Enter your new name:', player?.name);
    if (newName && newName.trim().length > 0) {
      setPlayerName(newName.trim());
      // The socket connection isn't usually active until we join a room,
      // but if it is, this handles it. For now, the database will be updated
      // via the createPlayer or we need a new API endpoint for name change outside room.
      // Wait, we need an API endpoint to update the DB directly if they aren't in a room!
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

      {/* Admin Button */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => router.push('/admin')}
          className="p-2 rounded-full bg-surface-light border border-white/10 text-text-muted hover:text-white hover:bg-surface transition-all shadow-lg"
          title="Admin Panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      </div>

      <div className="z-10 w-full max-w-md">
        {!player ? (
          <NameInput onSubmit={createPlayer} isLoading={isCreating} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8 flex flex-col items-center justify-center gap-2">
              <p className="text-xl">Welcome back, <span className="font-bold text-primary">{player.name}</span>!</p>
              <button 
                onClick={handleNameChange}
                className="text-xs text-text-muted hover:text-white transition-colors underline"
              >
                Change Name
              </button>
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
