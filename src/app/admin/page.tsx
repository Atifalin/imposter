'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [words, setWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // New word form state
  const [category, setCategory] = useState('');
  const [word, setWord] = useState('');
  const [easyHint, setEasyHint] = useState('');
  const [mediumHint, setMediumHint] = useState('');
  const [hardHint, setHardHint] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin-secret-key') {
      setIsAuthenticated(true);
      fetchWords();
    } else {
      alert('Invalid password');
    }
  };

  const fetchWords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/words', {
        headers: { 'Authorization': 'Bearer admin-secret-key' }
      });
      const data = await res.json();
      if (res.ok) setWords(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-secret-key'
        },
        body: JSON.stringify({ category, word, easyHint, mediumHint, hardHint })
      });
      
      if (res.ok) {
        setWord('');
        setEasyHint('');
        setMediumHint('');
        setHardHint('');
        fetchWords(); // Refresh
      } else {
        alert('Failed to add word');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return;
    try {
      const res = await fetch(`/api/admin/words/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer admin-secret-key' }
      });
      if (res.ok) fetchWords();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-strong p-8 rounded-2xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full bg-surface-light text-text px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button type="submit" className="w-full btn-primary px-4 py-3 rounded-xl font-bold">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">EzyImposter Admin</h1>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-surface-light rounded-lg">Back to Home</button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="glass-strong p-6 rounded-2xl md:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4">Add Custom Word</h2>
          <form onSubmit={handleAddWord} className="space-y-4">
            <input
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (e.g. Marvel)"
              className="w-full bg-surface-light px-4 py-2 rounded-lg outline-none"
            />
            <input
              required
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Secret Word (e.g. Iron Man)"
              className="w-full bg-surface-light px-4 py-2 rounded-lg outline-none"
            />
            <input
              value={easyHint}
              onChange={(e) => setEasyHint(e.target.value)}
              placeholder="Easy Hint"
              className="w-full bg-surface-light px-4 py-2 rounded-lg outline-none"
            />
            <input
              required
              value={mediumHint}
              onChange={(e) => setMediumHint(e.target.value)}
              placeholder="Medium Hint"
              className="w-full bg-surface-light px-4 py-2 rounded-lg outline-none"
            />
            <input
              value={hardHint}
              onChange={(e) => setHardHint(e.target.value)}
              placeholder="Hard Hint"
              className="w-full bg-surface-light px-4 py-2 rounded-lg outline-none"
            />
            <button type="submit" className="w-full btn-primary py-2 rounded-lg font-bold">
              Add Word
            </button>
          </form>
        </div>

        <div className="glass-strong p-6 rounded-2xl md:col-span-2 overflow-auto max-h-[80vh]">
          <h2 className="text-xl font-bold mb-4">Word Database ({words.length})</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              {words.map((w) => (
                <div key={w.id} className="bg-surface-light p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-xs text-primary font-bold">{w.category}</span>
                    <p className="font-bold text-white">{w.word}</p>
                    <p className="text-xs text-text-muted">Hint: {w.mediumHint}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(w.id)}
                    className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-400/10 rounded"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
