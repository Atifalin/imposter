import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { usePlayer } from './usePlayer';

export function useWebRTC(roomCode: string | undefined, remoteMode: boolean = false) {
  const { socket } = useSocket();
  const { player } = usePlayer();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true); // Mic muted by default
  const [voiceJoined, setVoiceJoined] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});
  
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number>(0);
  const analysersRef = useRef<Record<string, AnalyserNode>>({});

  const initVoice = async () => {
    if (!remoteMode || !roomCode || !socket || !player) return;
    
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      // Mute local mic initially
      userStream.getAudioTracks().forEach(track => track.enabled = false);
      
      setStream(userStream);
      setVoiceJoined(true);
      
      // Initialize AudioContext for speaking indicators
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Analyze local stream
      setupAnalyser('local', userStream);
      
      // Request connections
      socket.emit('request-webrtc-connections');
      
      startAudioLoop();
    } catch (err) {
      console.error('Failed to get media devices:', err);
      alert('Microphone access is required for voice chat.');
    }
  };

  const setupAnalyser = (id: string, mediaStream: MediaStream) => {
    if (!audioContextRef.current) return;
    const source = audioContextRef.current.createMediaStreamSource(mediaStream);
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.4;
    source.connect(analyser);
    analysersRef.current[id] = analyser;
  };

  const startAudioLoop = () => {
    let lastCheck = 0;
    const FRAME_INTERVAL = 42; // ~24fps (1000ms / 24 = 41.6ms)
    
    const checkAudioLevels = (timestamp: number) => {
      if (timestamp - lastCheck < FRAME_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(checkAudioLevels);
        return;
      }
      lastCheck = timestamp;
      
      if (!audioContextRef.current) return;
      
      const newSpeakingState: Record<string, boolean> = {};
      const dataArray = new Uint8Array(128); // half of fftSize

      for (const [id, analyser] of Object.entries(analysersRef.current)) {
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // Threshold for speaking
        newSpeakingState[id] = average > 15;
      }

      setSpeakingPeers(prev => {
        let changed = false;
        for (const key in newSpeakingState) {
          if (prev[key] !== newSpeakingState[key]) changed = true;
        }
        for (const key in prev) {
          if (prev[key] !== newSpeakingState[key]) changed = true;
        }
        return changed ? newSpeakingState : prev;
      });

      animationFrameRef.current = requestAnimationFrame(checkAudioLevels);
    };
    
    requestAnimationFrame(checkAudioLevels);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
      if (stream) stream.getTracks().forEach(t => t.stop());
      Object.values(peersRef.current).forEach(peer => peer.close());
    };
  }, [stream]);

  const setMicEnabled = useCallback((enabled: boolean) => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      setIsMuted(!enabled);
      socket?.emit('mute-status-changed', { muted: !enabled });
    }
  }, [stream, socket]);

  const createPeerConnection = (targetId: string, initiator: boolean) => {
    if (peersRef.current[targetId]) return peersRef.current[targetId];

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    if (stream) {
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
      });
    }

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('webrtc-ice-candidate', { targetId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      const incomingStream = event.streams[0];
      setRemoteStreams(prev => ({
        ...prev,
        [targetId]: incomingStream
      }));
      setupAnalyser(targetId, incomingStream);
    };

    if (initiator) {
      peer.createOffer().then(offer => {
        peer.setLocalDescription(offer);
        socket?.emit('webrtc-offer', { targetId, sdp: offer });
      });
    }

    peersRef.current[targetId] = peer;
    return peer;
  };

  useEffect(() => {
    if (!socket || !remoteMode || !voiceJoined) return;

    const handlePlayerJoined = (newPlayer: any) => {
      if (newPlayer.id !== player?.id) {
        createPeerConnection(newPlayer.id, true);
      }
    };

    const handleOffer = async ({ senderId, sdp }: any) => {
      const peer = createPeerConnection(senderId, false);
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('webrtc-answer', { targetId: senderId, sdp: answer });
    };

    const handleAnswer = async ({ senderId, sdp }: any) => {
      const peer = peersRef.current[senderId];
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    };

    const handleIce = async ({ senderId, candidate }: any) => {
      const peer = peersRef.current[senderId];
      if (peer) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch(e) {
          console.error(e);
        }
      }
    };

    const handleLeft = (playerId: string) => {
      if (peersRef.current[playerId]) {
        peersRef.current[playerId].close();
        delete peersRef.current[playerId];
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[playerId];
          return newStreams;
        });
        delete analysersRef.current[playerId];
      }
    };

    const handleHostMute = () => {
      setMicEnabled(false);
    };

    socket.on('player-joined', handlePlayerJoined);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIce);
    socket.on('player-left', handleLeft);
    socket.on('host-mute-all', handleHostMute);

    return () => {
      socket.off('player-joined', handlePlayerJoined);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIce);
      socket.off('player-left', handleLeft);
      socket.off('host-mute-all', handleHostMute);
    };
  }, [socket, remoteMode, player, voiceJoined, stream]);

  return { 
    voiceJoined, 
    initVoice, 
    isMuted, 
    setMicEnabled, 
    remoteStreams, 
    speakingPeers 
  };
}
