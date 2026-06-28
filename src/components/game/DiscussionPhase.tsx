'use client';

import { motion } from 'motion/react';
import { GameState } from '../../types/game';
import { PlayerState } from '../../types/player';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useState, useEffect, useRef } from 'react';

interface DiscussionPhaseProps {
  roomState: GameState;
  players: PlayerState[];
  timer: number | null;
  currentPlayerId: string;
}

interface ChatMessage {
  id: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export default function DiscussionPhase({ roomState, players, timer, currentPlayerId }: DiscussionPhaseProps) {
  const { socket } = useSocket();
  const isHost = roomState.hostPlayerId === currentPlayerId;
  const remoteMode = roomState.settings.remoteMode || false;
  
  const { 
    voiceJoined, 
    initVoice, 
    isMuted, 
    setMicEnabled, 
    remoteStreams, 
    speakingPeers 
  } = useWebRTC(roomState.code, remoteMode);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [masterMuted, setMasterMuted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !remoteMode) return;
    
    socket.on('chat-message', (data: any) => {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        senderName: data.senderName,
        message: data.message,
        timestamp: data.timestamp
      }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket, remoteMode]);

  // Push to talk (Spacebar)
  useEffect(() => {
    if (!voiceJoined) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in chat
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setMicEnabled(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setMicEnabled(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      setMicEnabled(false);
    };
  }, [voiceJoined, setMicEnabled]);

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && socket) {
      socket.emit('chat-message', { message: chatInput.trim() });
      setChatInput('');
    }
  };

  const handleStartVoting = () => {
    if (!socket || !isHost) return;
    socket.emit('start-voting');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full pb-32 md:pb-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-widest text-white neon-glow">
          Round {roomState.currentRound?.roundNumber}
        </h2>
        <div className="inline-block glass px-8 py-3 rounded-full text-xl font-bold text-accent shadow-[0_0_15px_rgba(236,72,153,0.3)]">
          Discussion Time
        </div>
      </div>

      {timer !== null && (
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full glass-strong">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64" cy="64" r="58"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
              />
              <circle
                cx="64" cy="64" r="58"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="6"
                strokeDasharray="364"
                strokeDashoffset={364 - (timer / (roomState.settings.timerSeconds || 120)) * 364}
                className="transition-all duration-1000 linear"
              />
            </svg>
            <span className="text-3xl font-black text-white">{formatTime(timer)}</span>
          </div>
        </div>
      )}

      {remoteMode && !voiceJoined && (
        <div className="flex justify-center mb-8">
          <button 
            onClick={initVoice}
            className="btn-primary py-3 px-8 rounded-full font-bold shadow-lg animate-pulse"
          >
            🎤 Join Voice Chat
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1 content-start">
        {players.map((p, i) => {
          const remoteStream = remoteStreams[p.id];
          const isSpeaking = speakingPeers[p.id] || (p.id === currentPlayerId && !isMuted);
          
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 relative ${
                !p.connected ? 'opacity-50' : ''
              } ${isSpeaking ? 'ring-4 ring-success shadow-[0_0_20px_rgba(34,197,94,0.5)]' : ''}`}
            >
              {remoteMode && p.id !== currentPlayerId && remoteStream && (
                <audio 
                  autoPlay 
                  muted={masterMuted}
                  ref={(audio) => {
                    if (audio && !audio.srcObject) audio.srcObject = remoteStream;
                  }}
                />
              )}
              
              <div className="relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-inner ${
                  p.id === currentPlayerId ? 'bg-primary border-2 border-primary-light' : 'bg-surface-light border border-white/10'
                }`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Speaking Indicator Icon */}
                {isSpeaking && (
                  <div className="absolute -top-2 -right-2 bg-success text-white p-1 rounded-full animate-bounce">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                )}

                {remoteMode && p.id === currentPlayerId && (
                  <div 
                    className={`absolute -bottom-2 -right-2 p-2 rounded-full shadow-lg border ${
                      isMuted ? 'bg-danger border-danger-light' : 'bg-success border-success-light'
                    }`}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      )}
                    </svg>
                  </div>
                )}
              </div>
              
              <div>
                <div className="font-bold text-lg text-white">{p.name}</div>
                {p.id === currentPlayerId && <div className="text-xs text-primary font-bold">YOU</div>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {remoteMode && (
        <div className="mt-8 glass rounded-2xl overflow-hidden flex flex-col h-64 border border-white/10 shadow-lg">
          <div className="p-3 bg-surface border-b border-white/10 font-bold text-sm text-text-muted flex justify-between items-center">
            <span>Room Chat</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setMasterMuted(!masterMuted)}
                className={`text-xs px-2 py-1 rounded transition-colors ${masterMuted ? 'bg-danger/20 text-danger hover:bg-danger/40' : 'bg-surface-light text-text-muted hover:text-white'}`}
              >
                {masterMuted ? '🔇 Unmute Speakers' : '🔊 Mute Speakers'}
              </button>
              {isHost && (
                <button 
                  onClick={() => socket?.emit('host-mute-all')}
                  className="text-xs bg-danger/20 text-danger hover:bg-danger/40 px-2 py-1 rounded transition-colors"
                >
                  Force Mute All
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map(m => (
              <div key={m.id} className="text-sm">
                <span className="font-bold text-primary-light mr-2">{m.senderName}:</span>
                <span className="text-white">{m.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChatMessage} className="flex p-2 bg-surface">
            <input 
              type="text" 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type a message (Spacebar to talk)..."
              className="flex-1 bg-surface-light border border-white/10 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
            <button type="submit" className="bg-primary hover:bg-primary-light px-4 rounded-r-lg text-white font-bold transition-colors">
              Send
            </button>
          </form>
        </div>
      )}

      {isHost ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center"
        >
          <button 
            onClick={handleStartVoting}
            className="btn-primary py-4 px-12 text-xl shadow-[0_0_30px_rgba(124,58,237,0.4)]"
          >
            Start Voting
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center text-center"
        >
          <div className="glass px-8 py-4 rounded-2xl text-text-muted font-medium animate-pulse">
            Waiting for the host to start voting...
          </div>
        </motion.div>
      )}

      {/* Mobile Push to Talk Button */}
      {remoteMode && voiceJoined && (
        <div className="fixed bottom-0 left-0 w-full p-4 md:hidden z-50 bg-gradient-to-t from-background to-transparent pointer-events-none">
          <button
            onPointerDown={() => setMicEnabled(true)}
            onPointerUp={() => setMicEnabled(false)}
            onPointerLeave={() => setMicEnabled(false)}
            onPointerCancel={() => setMicEnabled(false)}
            className="w-full btn-primary py-4 rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(124,58,237,0.5)] touch-none select-none pointer-events-auto active:scale-95 transition-transform"
          >
            {isMuted ? 'HOLD TO TALK 🎤' : 'SPEAKING... 🗣️'}
          </button>
        </div>
      )}
    </div>
  );
}
