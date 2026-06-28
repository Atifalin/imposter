import { useEffect, useRef, useState } from 'react';
import { useSocket } from './useSocket';
import { usePlayer } from './usePlayer';

export function useWebRTC(roomCode: string | undefined, remoteMode: boolean = false) {
  const { socket } = useSocket();
  const { player } = usePlayer();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});

  useEffect(() => {
    if (!remoteMode || !roomCode || !socket || !player) return;

    let mounted = true;

    const initMedia = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (mounted) {
          setStream(userStream);
          // Initial connection to existing players
          socket.emit('request-webrtc-connections');
        } else {
          userStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error('Failed to get media devices:', err);
      }
    };

    initMedia();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(peer => peer.close());
    };
  }, [remoteMode, roomCode, socket, player]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      const newMuted = !stream.getAudioTracks()[0]?.enabled;
      setIsMuted(newMuted);
      socket?.emit('mute-status-changed', { muted: newMuted });
    }
  };

  const createPeerConnection = (targetId: string, initiator: boolean) => {
    // If connection already exists, don't recreate
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
      setRemoteStreams(prev => ({
        ...prev,
        [targetId]: event.streams[0]
      }));
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
    if (!socket || !remoteMode) return;

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
      }
    };

    const handleHostMute = () => {
      if (stream) {
        stream.getAudioTracks().forEach(track => track.enabled = false);
        setIsMuted(true);
        socket.emit('mute-status-changed', { muted: true });
      }
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
  }, [socket, remoteMode, player, stream]);

  return { stream, isMuted, toggleMute, remoteStreams };
}
