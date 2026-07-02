import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RoomSettings } from '../../types/game';
import { DEFAULT_CATEGORIES, DIFFICULTY_LEVELS, MAX_PLAYERS } from '../../lib/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: RoomSettings;
  onSave: (settings: RoomSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, currentSettings, onSave }: SettingsModalProps) {
  const [categories, setCategories] = useState<string[]>(currentSettings.categories || []);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(currentSettings.difficulty || 'medium');
  const [imposterCount, setImposterCount] = useState(currentSettings.imposterCount || 1);
  
  // Timer Settings
  const [discussionTimerEnabled, setDiscussionTimerEnabled] = useState(currentSettings.discussionTimerEnabled ?? false);
  const [discussionTimerSeconds, setDiscussionTimerSeconds] = useState(currentSettings.discussionTimerSeconds || 120);
  const [votingTimerEnabled, setVotingTimerEnabled] = useState(currentSettings.votingTimerEnabled ?? false);
  const [votingTimerSeconds, setVotingTimerSeconds] = useState(currentSettings.votingTimerSeconds || 60);

  // Remote Mode Setting
  const [remoteMode, setRemoteMode] = useState(currentSettings.remoteMode || false);

  // Sync state if modal opens with new props
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setCategories(currentSettings.categories || []);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setDifficulty(currentSettings.difficulty || 'medium');
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setImposterCount(currentSettings.imposterCount || 1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setDiscussionTimerEnabled(currentSettings.discussionTimerEnabled ?? false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setDiscussionTimerSeconds(currentSettings.discussionTimerSeconds || 120);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setVotingTimerEnabled(currentSettings.votingTimerEnabled ?? false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setVotingTimerSeconds(currentSettings.votingTimerSeconds || 60);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setRemoteMode(currentSettings.remoteMode || false);
    }
  }, [isOpen, currentSettings]);

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const handleSave = () => {
    if (categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    onSave({
      categories,
      difficulty,
      imposterCount,
      discussionTimerEnabled,
      discussionTimerSeconds,
      votingTimerEnabled,
      votingTimerSeconds,
      remoteMode
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-y-auto bg-background/80 backdrop-blur-md"
      >
        <div className="min-h-full flex items-center justify-center p-4 py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-strong rounded-[2.5rem] p-6 md:p-8 w-full max-w-2xl relative border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent uppercase tracking-widest">
                Room Settings
              </h2>
              <p className="text-text-muted text-sm mt-1">Configure your game rules</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full bg-surface-light border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-danger/20 hover:border-danger/50 transition-all shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="space-y-8">
            
            {/* Quick Toggles (Remote Mode & Timers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Remote Mode Toggle */}
              <div 
                onClick={() => setRemoteMode(!remoteMode)}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  remoteMode ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(124,58,237,0.3)]' : 'bg-surface border-white/10 hover:border-white/30'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.22 2.416a2 2 0 0 0-2.511.057l-7 5.999A2 2 0 0 0 3 10v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-.709-1.528l-7-5.999z"></path><path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"></path></svg>
                    Remote Play
                  </div>
                  <div className="text-xs text-text-muted mt-1">Enables P2P Voice Chat</div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${remoteMode ? 'bg-primary' : 'bg-surface-light'}`}>
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{ x: remoteMode ? 24 : 0 }}
                  />
                </div>
              </div>

              {/* Empty slot for balance, or move voting timer here later */}
            </div>

            {/* Timers Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Time Limits
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Discussion Timer */}
                <div className={`bg-surface/30 p-4 rounded-2xl border transition-all ${discussionTimerEnabled ? 'border-accent shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'border-white/5'}`}>
                  <div 
                    className="flex justify-between items-center cursor-pointer mb-4"
                    onClick={() => setDiscussionTimerEnabled(!discussionTimerEnabled)}
                  >
                    <div>
                      <div className="font-bold text-white">Discussion Time</div>
                      <div className="text-xs text-text-muted">{discussionTimerEnabled ? `${discussionTimerSeconds}s` : 'Unlimited'}</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${discussionTimerEnabled ? 'bg-accent' : 'bg-surface-light'}`}>
                      <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" animate={{ x: discussionTimerEnabled ? 24 : 0 }} />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {discussionTimerEnabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <input 
                          type="range" min="30" max="300" step="30" value={discussionTimerSeconds}
                          onChange={(e) => setDiscussionTimerSeconds(Number(e.target.value))}
                          className="w-full accent-accent h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Voting Timer */}
                <div className={`bg-surface/30 p-4 rounded-2xl border transition-all ${votingTimerEnabled ? 'border-primary shadow-[0_0_15px_rgba(124,58,237,0.2)]' : 'border-white/5'}`}>
                  <div 
                    className="flex justify-between items-center cursor-pointer mb-4"
                    onClick={() => setVotingTimerEnabled(!votingTimerEnabled)}
                  >
                    <div>
                      <div className="font-bold text-white">Voting Time</div>
                      <div className="text-xs text-text-muted">{votingTimerEnabled ? `${votingTimerSeconds}s` : 'Unlimited'}</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${votingTimerEnabled ? 'bg-primary' : 'bg-surface-light'}`}>
                      <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" animate={{ x: votingTimerEnabled ? 24 : 0 }} />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {votingTimerEnabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <input 
                          type="range" min="15" max="120" step="15" value={votingTimerSeconds}
                          onChange={(e) => setVotingTimerSeconds(Number(e.target.value))}
                          className="w-full accent-primary h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* Imposter Count */}
            <section className="bg-surface/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-danger">😈</span> Imposters Count
                </h3>
                <p className="text-sm text-text-muted">How many traitors are hiding?</p>
              </div>
              <div className="flex items-center gap-4 bg-surface-light p-1 rounded-full border border-white/10 shadow-inner">
                <button 
                  onClick={() => setImposterCount(Math.max(1, imposterCount - 1))}
                  className="w-10 h-10 rounded-full bg-surface hover:bg-danger hover:text-white transition-colors flex items-center justify-center text-xl font-bold"
                >
                  -
                </button>
                <span className="text-2xl font-black w-8 text-center text-white">{imposterCount}</span>
                <button 
                  onClick={() => setImposterCount(Math.min(Math.floor(MAX_PLAYERS/3), imposterCount + 1))}
                  className="w-10 h-10 rounded-full bg-surface hover:bg-danger hover:text-white transition-colors flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
              </div>
            </section>

            {/* Difficulty */}
            <section>
              <h3 className="text-lg font-bold mb-3 text-white">Hint Difficulty</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DIFFICULTY_LEVELS.map(level => {
                  const isSelected = difficulty === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setDifficulty(level.id as any)}
                      className={`p-4 rounded-2xl text-center transition-all border relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-surface to-surface-light border-accent shadow-[0_0_15px_rgba(236,72,153,0.3)] transform scale-105'
                          : 'bg-surface border-white/10 hover:border-white/30 hover:bg-surface-light'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-accent rounded-bl-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                      <div className={`font-black uppercase tracking-wider mb-1 ${isSelected ? 'text-accent' : 'text-white'}`}>
                        {level.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Categories */}
            <section>
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-lg font-bold text-white">Word Categories</h3>
                <span className="text-xs text-text-muted">{categories.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2 p-4 bg-surface/30 rounded-2xl border border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                {DEFAULT_CATEGORIES.map(cat => {
                  const isSelected = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                        isSelected 
                          ? 'bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-primary-light' 
                          : 'bg-surface border border-white/10 text-text-muted hover:border-white/30 hover:text-white hover:bg-surface-light'
                      }`}
                    >
                      {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </section>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={categories.length === 0}
              className={`w-full py-4 text-xl rounded-2xl font-black uppercase tracking-widest transition-all mt-4 ${
                categories.length > 0 
                  ? 'bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] text-white' 
                  : 'bg-surface border border-white/10 text-text-muted cursor-not-allowed'
              }`}
            >
              Save Settings
            </motion.button>
          </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
