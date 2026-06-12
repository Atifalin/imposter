'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

interface NameInputProps {
  onSubmit: (name: string) => void;
  isLoading?: boolean;
}

export function NameInput({ onSubmit, isLoading }: NameInputProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (name.trim().length > 15) {
      setError('Name must be less than 15 characters');
      return;
    }
    setError('');
    onSubmit(name.trim());
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong p-8 rounded-2xl w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-center neon-text">Who are you?</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter your name"
            className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            maxLength={15}
            disabled={isLoading}
            autoFocus
          />
          {error && <p className="text-danger text-sm mt-2 ml-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading || name.trim().length < 2}
          className="w-full btn-primary flex justify-center items-center"
        >
          {isLoading ? (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            'Continue'
          )}
        </button>
      </form>
    </motion.div>
  );
}
