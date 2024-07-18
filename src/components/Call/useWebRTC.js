import { useState, useEffect, useRef } from 'react';

const useWebRTC = (socket, caller, callee) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [rtcPeerConnection, setRtcPeerConnection] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [calling, setCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [showReceiverModal, setShowReceiverModal] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const setupSocketListeners = () => {
      socket.on('incoming_call', handleIncomingCall);
      socket.on('call_ended', handleCallEnded);
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('ice_candidate', handleIceCandidate);

      return () => {
        socket.off('incoming_call', handleIncomingCall);
        socket.off('call_ended', handleCallEnded);
        socket.off('offer', handleOffer);
        socket.off('answer', handleAnswer);
        socket.off('ice_candidate', handleIceCandidate);
      };
    };

    if (socket) {
      setupSocketListeners();
    }
  }, [socket]);

  const handleIncomingCall = () => {
    setShowReceiverModal(true); // Hiển thị modal khi có cuộc gọi đến
    setIncomingCall(true); // Đánh dấu có cuộc gọi đến
  };

  const handleCallEnded = () => {
    endCall(true);
  };

  const handleOffer = async (offer) => {
    try {
      const peerConnection = createPeerConnection();
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      if (caller && caller._id) {
        socket.emit('answer', { targetUserId: caller._id, answerData: answer });
      } else {
        console.error('Caller information is missing');
      }
      setRtcPeerConnection(peerConnection);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer) => {
    if (rtcPeerConnection) {
      await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      setCallAccepted(true);
    }
  };

  const handleIceCandidate = (candidate) => {
    if (rtcPeerConnection) {
      if (callee && callee._id) {
        rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        console.error('Callee information is missing');
      }
    }
  };

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection();
    peerConnection.onicecandidate = handleICECandidate;
    peerConnection.ontrack = handleTrackEvent;
    return peerConnection;
  };

  const handleICECandidate = (event) => {
    if (event.candidate) {
      if (callee && callee._id) {
        socket.emit('ice_candidate', { targetUserId: callee._id, candidateData: event.candidate });
      } else {
        console.error('Callee information is missing');
      }
    }
  };

  const handleTrackEvent = (event) => {
    setRemoteStream(event.streams[0]);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const peerConnection = createPeerConnection();
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      if (callee && callee._id) {
        socket.emit('start_call', { targetUserId: callee._id, offerData: offer });
        console.log(callee._id, "start_call");
      } else {
        console.error('Callee information is missing');
      }
      setRtcPeerConnection(peerConnection);
      setCalling(true);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const peerConnection = createPeerConnection();
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      setCallAccepted(true);
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const endCall = (fromRemote = false) => {
    if (rtcPeerConnection) {
      rtcPeerConnection.close();
      setRtcPeerConnection(null);
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    setCalling(false);
    setCallAccepted(false);
    setIncomingCall(false);
    setShowReceiverModal(false);
    if (socket && !fromRemote && callee && callee._id) {
      socket.emit('end_call', { targetUserId: callee._id });
    }
    // Disable microphone tracks
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = false);
    }
  };

  const handleToggleMic = () => {
    setIsMicMuted((prevState) => {
      const newMicState = !prevState;
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = !newMicState;
        });
      }
      return newMicState;
    });
  };
  

  return {
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    calling,
    callAccepted,
    incomingCall,
    showReceiverModal,
    startCall,
    acceptCall,
    endCall,
    handleToggleMic,
    handleListen: () => {
      acceptCall();
      setShowReceiverModal(false);
    },
    isMicMuted
  };
};

export default useWebRTC;
