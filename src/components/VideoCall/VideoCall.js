import React, { useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const VideoCall = ({ onEndCall }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const startVideoCall = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = localStream;

        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;

        callTimeoutRef.current = setTimeout(() => {
          toast.error('The call was not answered. Automatically ending.');
          onEndCall();
        }, 30000); 

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected') {
            clearTimeout(callTimeoutRef.current);
          }
          if (pc.iceConnectionState === 'disconnected') {
            onEndCall();
          }
        };

        pc.onicecandidate = event => {
          if (event.candidate) {
          }
        };

        pc.ontrack = event => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        localStream.getTracks()?.forEach(track => {
          pc.addTrack(track, localStream);
        });

      } catch (error) {
        toast.error('Failed to access camera and microphone.');
        onEndCall();
      }
    };

    const checkMediaDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');

        if (!hasCamera || !hasMicrophone) {
          toast.error('Device does not support camera or microphone.');
          onEndCall();
          return;
        }

        startVideoCall();
      } catch (error) {
        toast.error('Failed to access camera and microphone.');
        onEndCall();
      }
    };

    checkMediaDevices();

    return () => {
      const localVideoElement = localVideoRef.current;
      const remoteVideoElement = remoteVideoRef.current;
      const pc = peerConnectionRef.current;

      localVideoElement?.srcObject?.getTracks()?.forEach(track => track.stop());
      remoteVideoElement?.srcObject?.getTracks()?.forEach(track => track.stop());

      if (pc) {
        pc.close();
      }

      clearTimeout(callTimeoutRef.current);
    };
  }, [onEndCall]);

  return (
    <div>
      <div>
        <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
        <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
      </div>
      <button onClick={onEndCall}>End Call</button>
    </div>
  );
};

export default VideoCall;
