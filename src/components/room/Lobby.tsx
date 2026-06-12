'use client';

import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { GameState } from '../../types/game';
import { PlayerState } from '../../types/player';
import { useSocket } from '../../hooks/useSocket';
import { MIN_PLAYERS } from '../../lib/constants';

interface LobbyProps {
  roomState: GameState;
  players: PlayerState[];
  currentPlayerId: string;
}

export default function Lobby({ roomState, players, currentPlayerId }: LobbyProps) {
  const { socket } = useSocket();
  const isHost = roomState.hostPlayerId === currentPlayerId;

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join/${roomState.code}` 
    : '';

  const handleStart = () => {
    if (!socket || !isHost) return;
    socket.emit('start-round');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    // Add toast logic here later
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-8 p-4 md:p-8 max-w-6xl mx-auto w-full">
      {/* Left Column: Room Info & QR */}
      <div className="flex flex-col gap-6 md:w-1/3">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          
          <h2 className="text-text-muted font-semibold tracking-wider text-sm mb-2 uppercase">Room Code</h2>
          <div 
            onClick={() => {
              navigator.clipboard.writeText(roomState.code);
            }}
            className="text-5xl md:text-6xl font-black text-white tracking-[0.2em] mb-8 cursor-pointer hover:neon-glow-accent transition-all select-all"
          >
            {roomState.code}
          </div>

          <div className="bg-white p-4 rounded-2xl mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <QRCodeSVG value={joinUrl} size={180} />
          </div>

          <button 
            onClick={copyLink}
            className="btn-ghost w-full flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy Join Link
          </button>
        </motion.div>

        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={handleStart}
              disabled={players.length < MIN_PLAYERS}
              className={`w-full py-5 text-xl rounded-2xl font-bold text-white transition-all ${
                players.length >= MIN_PLAYERS 
                  ? 'bg-gradient-to-r from-success to-emerald-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transform hover:scale-105 active:scale-95' 
                  : 'bg-surface-light border border-white/10 opacity-50 cursor-not-allowed'
              }`}
            >
              {players.length >= MIN_PLAYERS ? 'START GAME' : `Waiting for players (${players.length}/${MIN_PLAYERS})`}
            </button>
          </motion.div>
        )}
      </div>

      {/* Right Column: Player List */}
      <div className="flex-1">
        <div className="glass rounded-3xl p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Players <span className="text-text-muted text-lg font-normal">({players.length})</span></h2>
            {isHost && (
              <button 
                onClick={() => {
                  import('react-hot-toast').then(m => m.default('Settings can only be adjusted during room creation.', { icon: 'ℹ️' }));
                }}
                className="text-text-muted hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${
                  p.id === currentPlayerId 
                    ? 'bg-primary/20 border-primary/50' 
                    : 'bg-surface/50 border-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-surface-light to-surface flex items-center justify-center font-bold text-lg text-white shadow-inner relative">
                  {p.name.charAt(0).toUpperCase()}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${p.connected ? 'bg-success' : 'bg-text-muted'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate flex items-center gap-2">
                    {p.name}
                    {p.isHost && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">HOST</span>
                    )}
                  </div>
                  {!p.connected && <div className="text-xs text-text-muted">Disconnected</div>}
                </div>
                {isHost && p.id !== currentPlayerId && (
                  <button className="text-text-muted hover:text-danger p-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
              </motion.div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, MIN_PLAYERS - players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-white/10 bg-transparent opacity-50">
                <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/20">?</div>
                <div className="font-medium text-text-muted">Waiting...</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
