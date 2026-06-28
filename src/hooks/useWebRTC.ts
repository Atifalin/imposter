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
  const localSpeakingRef = useRef<boolean>(false);

  const initVoice = async () => {
    if (!remoteMode || !roomCode || !socket || !player) return;
    
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: false 
      });
      
      // Mute local mic initially
      userStream.getAudioTracks().forEach(track => track.enabled = false);
      
      setStream(userStream);
      setVoiceJoined(true);
      
      // Initialize AudioContext for speaking indicators
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Resume AudioContext on mobile
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Analyze local stream only
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
      
      const localAnalyser = analysersRef.current['local'];
      if (!localAnalyser) return;
      
      const dataArray = new Uint8Array(128); // half of fftSize
      localAnalyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Threshold for speaking
      const isSpeaking = average > 15;
      
      if (localSpeakingRef.current !== isSpeaking) {
        localSpeakingRef.current = isSpeaking;
        // Broadcast our speaking status to others
        socket?.emit('speaking-status', { speaking: isSpeaking });
      }

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
      
      // If we are muting, force local speaking state to false instantly
      if (!enabled && localSpeakingRef.current) {
        localSpeakingRef.current = false;
        socket?.emit('speaking-status', { speaking: false });
      }
    }
  }, [stream, socket]);

  const createPeerConnection = (targetId: string, initiator: boolean) => {
    if (peersRef.current[targetId]) return peersRef.current[targetId];

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
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
      // We NO LONGER setup analyzer for remote streams to avoid Web Audio API mobile bugs!
      // We rely on WebSocket 'speaking-status' instead.
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
        setSpeakingPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[playerId];
          return newPeers;
        });
      }
    };

    const handleSpeakingStatus = ({ playerId, speaking }: { playerId: string, speaking: boolean }) => {
      setSpeakingPeers(prev => ({
        ...prev,
        [playerId]: speaking
      }));
    };

    const handleHostMute = () => {
      setMicEnabled(false);
    };

    socket.on('player-joined', handlePlayerJoined);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIce);
    socket.on('player-left', handleLeft);
    socket.on('speaking-status', handleSpeakingStatus);
    socket.on('host-mute-all', handleHostMute);

    return () => {
      socket.off('player-joined', handlePlayerJoined);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIce);
      socket.off('player-left', handleLeft);
      socket.off('speaking-status', handleSpeakingStatus);
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

