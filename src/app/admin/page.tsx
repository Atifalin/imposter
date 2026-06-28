'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [words, setWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'words' | 'bulk'>('words');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New word form state
  const [category, setCategory] = useState('');
  const [word, setWord] = useState('');
  const [easyHint, setEasyHint] = useState('');
  const [mediumHint, setMediumHint] = useState('');
  const [hardHint, setHardHint] = useState('');

  // Bulk import state
  const [jsonInput, setJsonInput] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
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
        headers: { 'Authorization': 'Bearer admin123' }
      });
      const data = await res.json();
      if (res.ok) {
        setWords(data);
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].category);
        }
      }
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
          'Authorization': 'Bearer admin123'
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
        headers: { 'Authorization': 'Bearer admin123' }
      });
      if (res.ok) fetchWords();
    } catch (e) {
      console.error(e);
    }
  };

  // Edit state
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch('/api/admin/words/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': 'admin123'
        },
        body: JSON.stringify({ words: parsed })
      });
      if (res.ok) {
        alert('Import successful!');
        setJsonInput('');
        fetchWords();
        setActiveTab('words');
      } else {
        const data = await res.json();
        alert('Import failed: ' + data.error);
      }
    } catch (e) {
      alert('Invalid JSON format');
    }
  };

  const startEdit = (word: any) => {
    setEditingWordId(word.id);
    setEditFormData({
      category: word.category,
      word: word.word,
      easyHint: word.easyHint,
      mediumHint: word.mediumHint,
      hardHint: word.hardHint
    });
  };

  const handleEditSave = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/words/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin123'
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        setEditingWordId(null);
        fetchWords();
      } else {
        alert('Failed to update word');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Are you sure? This will wipe all existing words and restore the defaults.')) return;
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'X-Admin-Password': 'admin123' }
      });
      if (res.ok) {
        alert('Database seeded!');
        fetchWords();
      }
    } catch (e) {
      alert('Seed failed');
    }
  };

  const handleRestart = async () => {
    if (!confirm('Are you sure you want to restart the server? This will disconnect all players.')) return;
    try {
      await fetch('/api/admin/restart', {
        method: 'POST',
        headers: { 'X-Admin-Password': 'admin123' }
      });
      alert('Server restart initiated. It may take a few seconds to come back online.');
      // Attempt to refresh after 3 seconds
      setTimeout(() => window.location.reload(), 3000);
    } catch (e) {
      alert('Failed to initiate restart');
    }
  };

  const [aiPromptStyle, setAiPromptStyle] = useState<'tricky' | 'funny' | 'obscure'>('tricky');

  const copyAiPrompt = () => {
    let styleInstruction = 'Make the hints clever and slightly challenging.';
    if (aiPromptStyle === 'funny') {
      styleInstruction = 'Make the hints humorous, meme-worthy, or ironically funny without completely giving it away.';
    } else if (aiPromptStyle === 'obscure') {
      styleInstruction = 'Make the hardHint extremely obscure, requiring niche knowledge that sounds completely unrelated but is technically accurate.';
    }

    const prompt = `Please generate exactly 25 words or phrases for the category/topic: "${aiTopic}".
${styleInstruction}
I need this in a raw JSON array format so I can directly import it into my game database.
Do not wrap the JSON in markdown code blocks, just output the raw JSON array.
Each item in the array must be an object with exactly these properties:
- "word": The secret word or phrase (string).
- "category": Must be exactly "${aiTopic}" for all of them.
- "easyHint": A slightly challenging riddle or description (string).
- "mediumHint": A moderate, tricky hint (string).
- "hardHint": A cryptic or vague hint (string).

Example structure:
[
  { "word": "Example", "category": "${aiTopic}", "easyHint": "A clear pattern", "mediumHint": "A representative form", "hardHint": "X.M.P.L" }
]
`;
    navigator.clipboard.writeText(prompt);
    alert('Prompt copied to clipboard! Paste it into ChatGPT, then paste its response into the JSON Bulk Import tool.');
    setShowAiModal(false);
  };

  const categoriesSet = useMemo(() => {
    const cats = new Set<string>();
    words.forEach(w => cats.add(w.category));
    return Array.from(cats).sort();
  }, [words]);

  const displayedWords = useMemo(() => {
    return words.filter(w => {
      if (w.category !== selectedCategory) return false;
      if (!searchQuery) return true;
      const lowerQ = searchQuery.toLowerCase();
      return (
        w.word.toLowerCase().includes(lowerQ) ||
        w.easyHint.toLowerCase().includes(lowerQ) ||
        w.mediumHint.toLowerCase().includes(lowerQ) ||
        w.hardHint.toLowerCase().includes(lowerQ)
      );
    });
  }, [words, selectedCategory, searchQuery]);

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
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">EzyImposter Admin</h1>
          <p className="text-text-muted">Total Words: {words.length} | Categories: {categoriesSet.length}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowAiModal(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
            ✨ AI Prompt Gen
          </button>
          <button onClick={handleSeed} className="px-4 py-2 bg-warning/20 text-warning border border-warning/50 rounded-lg hover:bg-warning/30 transition-colors">
            Seed Defaults
          </button>
          <button onClick={handleRestart} className="px-4 py-2 bg-danger/20 text-danger border border-danger/50 rounded-lg hover:bg-danger/30 transition-colors">
            Restart Server
          </button>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-surface-light rounded-lg">Exit</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-strong p-6 rounded-2xl">
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setActiveTab('words')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'words' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:text-white'}`}
              >
                Add Single
              </button>
              <button 
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'bulk' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:text-white'}`}
              >
                Bulk Import
              </button>
            </div>

            {activeTab === 'words' ? (
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
                  placeholder="Secret Word"
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
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-text-muted">Paste JSON array of words.</p>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-64 bg-surface-light px-4 py-2 rounded-lg outline-none resize-none font-mono text-sm"
                  placeholder="[{&#34;word&#34;: &#34;Batman&#34;, &#34;category&#34;: &#34;DC&#34;, &#34;difficulty&#34;: &#34;medium&#34;, &#34;hint&#34;: &#34;Dark Knight&#34;}]"
                />
                <button onClick={handleBulkImport} className="w-full btn-primary py-2 rounded-lg font-bold">
                  Import JSON
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Database */}
        <div className="glass-strong p-6 rounded-2xl lg:col-span-3 flex flex-col lg:h-[80vh] min-h-[500px]">
          {/* Categories Strip */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar shrink-0">
            {categoriesSet.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-accent text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]' 
                    : 'bg-surface border border-white/10 text-text-muted hover:text-white'
                }`}
              >
                {cat} ({words.filter(w => w.category === cat).length})
              </button>
            ))}
            {categoriesSet.length === 0 && !isLoading && (
              <p className="text-text-muted italic">No categories found.</p>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6 shrink-0">
            <input
              type="text"
              placeholder="Search words or hints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-light border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary placeholder-white/30"
            />
          </div>

          {/* Words List */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {displayedWords.map((w) => (
                  <div key={w.id} className="bg-surface border border-white/5 p-4 rounded-xl flex flex-col gap-4">
                    {editingWordId === w.id ? (
                      <div className="space-y-3">
                        <input
                          value={editFormData.word}
                          onChange={(e) => setEditFormData({ ...editFormData, word: e.target.value })}
                          className="w-full bg-surface-light px-3 py-2 rounded-lg outline-none text-white font-bold"
                          placeholder="Word"
                        />
                        <input
                          value={editFormData.easyHint}
                          onChange={(e) => setEditFormData({ ...editFormData, easyHint: e.target.value })}
                          className="w-full bg-surface-light px-3 py-2 text-sm rounded-lg outline-none"
                          placeholder="Easy Hint"
                        />
                        <input
                          value={editFormData.mediumHint}
                          onChange={(e) => setEditFormData({ ...editFormData, mediumHint: e.target.value })}
                          className="w-full bg-surface-light px-3 py-2 text-sm rounded-lg outline-none"
                          placeholder="Medium Hint"
                        />
                        <input
                          value={editFormData.hardHint}
                          onChange={(e) => setEditFormData({ ...editFormData, hardHint: e.target.value })}
                          className="w-full bg-surface-light px-3 py-2 text-sm rounded-lg outline-none"
                          placeholder="Hard Hint"
                        />
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => setEditingWordId(null)} className="flex-1 py-1 text-sm bg-surface-light rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                          <button onClick={() => handleEditSave(w.id)} className="flex-1 py-1 text-sm bg-success text-white rounded-lg font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]">Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-black text-base md:text-lg text-white break-words">{w.word}</p>
                            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] uppercase font-bold rounded-full tracking-wider shrink-0">{w.category}</span>
                          </div>
                          <p className="text-xs md:text-sm text-text-muted mt-2 break-words"><span className="opacity-50 text-[10px] md:text-xs uppercase tracking-wider block">Easy Hint</span> {w.easyHint}</p>
                          <p className="text-xs md:text-sm text-text-muted mt-1 break-words"><span className="opacity-50 text-[10px] md:text-xs uppercase tracking-wider block">Medium Hint</span> {w.mediumHint}</p>
                          <p className="text-xs md:text-sm text-text-muted mt-1 break-words"><span className="opacity-50 text-[10px] md:text-xs uppercase tracking-wider block">Hard Hint</span> {w.hardHint}</p>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-24 mt-2 sm:mt-0">
                          <button 
                            onClick={() => startEdit(w)}
                            className="flex-1 sm:flex-none text-primary hover:text-white hover:bg-primary px-3 py-2 bg-surface-light border border-primary/30 rounded-lg text-sm font-semibold transition-colors text-center"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(w.id)}
                            className="flex-1 sm:flex-none text-danger hover:text-white hover:bg-danger px-3 py-2 bg-surface-light border border-danger/30 rounded-lg text-sm font-semibold transition-colors text-center"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {displayedWords.length === 0 && (
                  <div className="col-span-2 text-center p-12 text-text-muted">
                    Select a category to view words
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Prompt Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-strong rounded-3xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-2">✨ AI Prompt Generator</h2>
              <p className="text-text-muted text-sm mb-6">Type a topic and click Generate. Then paste the copied prompt into ChatGPT.</p>
              
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. Harry Potter Characters"
                className="w-full bg-surface-light px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary mb-4 text-white"
                autoFocus
              />

              <div className="mb-6 space-y-2">
                <p className="text-sm font-bold text-white">Prompt Style:</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAiPromptStyle('tricky')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${aiPromptStyle === 'tricky' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:text-white'}`}
                  >
                    Tricky
                  </button>
                  <button 
                    onClick={() => setAiPromptStyle('funny')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${aiPromptStyle === 'funny' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:text-white'}`}
                  >
                    Funny
                  </button>
                  <button 
                    onClick={() => setAiPromptStyle('obscure')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${aiPromptStyle === 'obscure' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:text-white'}`}
                  >
                    Obscure
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 btn-secondary py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={copyAiPrompt}
                  disabled={!aiTopic.trim()}
                  className="flex-1 btn-primary py-3 rounded-xl disabled:opacity-50"
                >
                  Generate & Copy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
