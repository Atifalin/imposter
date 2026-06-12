import { useState } from 'react';
import { motion } from 'motion/react';

interface SimpleCardProps {
  word: string;
  isImposter: boolean;
  isReady?: boolean;
  onViewed: () => void;
}

export default function SimpleCard({ word, isImposter, isReady, onViewed }: SimpleCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handlePointerDown = () => {
    setIsRevealed(true);
    if (!isReady) {
      onViewed();
    }
  };

  const handlePointerUp = () => {
    setIsRevealed(false);
  };

  return (
    <div 
      className="w-full max-w-sm aspect-[2/3] mx-auto cursor-pointer touch-none select-none"
      style={{ perspective: '1000px' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div 
          className="absolute inset-0 bg-surface-light rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 text-center overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <div className="w-20 h-20 rounded-full border-4 border-primary/50 flex items-center justify-center mb-8 animate-pulse-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
          </div>
          <h3 className="text-3xl font-black text-white tracking-widest uppercase opacity-80">HOLD TO REVEAL</h3>
        </div>

        {/* Back of Card */}
        <div 
          className={`absolute inset-0 rounded-3xl border shadow-2xl flex flex-col items-center justify-center p-8 text-center ${
            isImposter 
              ? 'bg-gradient-to-br from-danger/90 to-danger/40 border-danger' 
              : 'bg-gradient-to-br from-primary to-accent border-white/20'
          }`}
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          {isImposter && (
            <div className="absolute top-6 w-full text-center">
              <span className="bg-black/30 text-white px-4 py-1 rounded-full text-xs uppercase tracking-widest font-black animate-pulse">
                YOU ARE THE IMPOSTER
              </span>
            </div>
          )}
          
          <div className="text-white/70 text-sm uppercase tracking-widest font-bold mb-4">
            {isImposter ? 'Your Hint' : 'Your Word'}
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-white break-words w-full" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            {word}
          </h2>
        </div>
      </motion.div>
    </div>
  );
}
