'use client';

import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { GameState } from '../../types/game';
import { PlayerState } from '../../types/player';
import { useSocket } from '../../hooks/useSocket';
import { MIN_PLAYERS } from '../../lib/constants';
import { useState } from 'react';
import SettingsModal from './SettingsModal';
import { usePlayer } from '../../hooks/usePlayer';

interface LobbyProps {
  roomState: GameState;
  players: PlayerState[];
  currentPlayerId: string;
}

export default function Lobby({ roomState, players, currentPlayerId }: LobbyProps) {
  const { socket } = useSocket();
  const { player: currentPlayer, setPlayerName } = usePlayer();
  const isHost = roomState.hostPlayerId === currentPlayerId;
  const [showSettings, setShowSettings] = useState(false);

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join/${roomState.code}` 
    : '';

  const handleStart = () => {
    if (!socket || !isHost) return;
    socket.emit('start-round');
  };

  const handleNameChange = () => {
    const newName = prompt('Enter your new name:', currentPlayer?.name);
    if (newName && newName.trim().length > 0) {
      setPlayerName(newName.trim());
      if (socket) {
        socket.emit('change-name', newName.trim());
      }
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    // Add toast logic here later
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-8 p-4 md:p-8 max-w-6xl mx-auto w-full min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* Left Column: Room Info & QR */}
      <div className="flex flex-col gap-6 lg:w-1/3 shrink-0">
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
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: 'Join EzyImposter',
                    text: 'Come play EzyImposter with me!',
                    url: joinUrl,
                  });
                } catch (err) {
                  copyLink();
                  import('react-hot-toast').then(m => m.default.success('Link copied!'));
                }
              } else {
                copyLink();
                import('react-hot-toast').then(m => m.default.success('Link copied!'));
              }
            }}
            className="btn-ghost w-full flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share Invite Link
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
                onClick={() => setShowSettings(true)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            )}
          </div>
          
          <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
            currentSettings={roomState.settings}
            onSave={(newSettings) => {
              if (socket) {
                socket.emit('update-settings', newSettings);
                import('react-hot-toast').then(m => m.default.success('Settings updated!'));
              }
            }}
          />
          
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
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="font-bold text-white truncate flex items-center gap-2">
                    {p.name}
                    {p.isHost && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">HOST</span>
                    )}
                  </div>
                  {!p.connected ? (
                    <div className="text-xs text-text-muted">Disconnected</div>
                  ) : p.id === currentPlayerId ? (
                    <button 
                      onClick={handleNameChange}
                      className="text-xs text-primary text-left hover:text-white transition-colors"
                    >
                      Change Name
                    </button>
                  ) : null}
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
