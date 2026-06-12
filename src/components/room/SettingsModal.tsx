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
  const [timerEnabled, setTimerEnabled] = useState(!!currentSettings.timerSeconds);
  const [timerSeconds, setTimerSeconds] = useState(currentSettings.timerSeconds || 120);

  // Sync state if modal opens with new props
  useEffect(() => {
    if (isOpen) {
      setCategories(currentSettings.categories || []);
      setDifficulty(currentSettings.difficulty || 'medium');
      setImposterCount(currentSettings.imposterCount || 1);
      setTimerEnabled(!!currentSettings.timerSeconds);
      setTimerSeconds(currentSettings.timerSeconds || 120);
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
      timerSeconds: timerEnabled ? timerSeconds : undefined
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-strong rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Room Settings</h2>
            <button onClick={onClose} className="text-text-muted hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Categories */}
            <section>
              <h3 className="text-lg font-semibold mb-3 text-white">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_CATEGORIES.map(cat => {
                  const isSelected = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
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
            </section>

            {/* Difficulty */}
            <section>
              <h3 className="text-lg font-semibold mb-3 text-white">Difficulty</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DIFFICULTY_LEVELS.map(level => {
                  const isSelected = difficulty === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setDifficulty(level.id as any)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-surface-light border-accent shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                          : 'bg-surface border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="font-bold text-white mb-1 text-sm">{level.label}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Imposter Count */}
            <section>
              <h3 className="text-lg font-semibold mb-3 text-white">Imposters</h3>
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

            <button
              onClick={handleSave}
              disabled={categories.length === 0}
              className="w-full btn-primary py-3 text-lg mt-4 font-bold"
            >
              Save Settings
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
