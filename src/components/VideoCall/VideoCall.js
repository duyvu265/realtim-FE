import React, { useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const VideoCall = ({ onEndCall }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const checkMediaDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');

      if (!hasCamera || !hasMicrophone) {
        toast.error('Thiết bị không hỗ trợ camera hoặc micro.');
        onEndCall();
        return;
      }

      startVideoCall();
    };

    const startVideoCall = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = localStream;

        // Thiết lập WebRTC connection ở đây
        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;

        // Thiết lập timeout để tự động ngắt cuộc gọi nếu không được trả lời sau 30 giây
        callTimeoutRef.current = setTimeout(() => {
          toast.error('Cuộc gọi không được trả lời. Tự động ngắt.');
          onEndCall();
        }, 30000); // 30 giây = 30000 milliseconds

        // Đảm bảo rằng onEndCall sẽ được gọi khi video call kết thúc
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected') {
            // Cuộc gọi đã được trả lời, hủy bỏ timeout
            clearTimeout(callTimeoutRef.current);
          }
          if (pc.iceConnectionState === 'disconnected') {
            onEndCall();
          }
        };

        // Xử lý ICE candidate
        pc.onicecandidate = event => {
          if (event.candidate) {
            // Gửi ICE candidate đến peer
          }
        };

        // Xử lý track của remote stream
        pc.ontrack = event => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        localStream.getTracks()?.forEach(track => {
          pc.addTrack(track, localStream);
        });

        // Tạo offer và xử lý signaling ở đây
      } catch (error) {
        toast.error('Không thể truy cập camera và micro.');
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
