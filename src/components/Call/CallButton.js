import React, { useState, useEffect } from 'react';
import { HiPhoneOutgoing, HiPhoneMissedCall } from "react-icons/hi";

const AudioCallButton = ({ onStartCall, onStopCall, socket }) => {
  const [calling, setCalling] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);

  useEffect(() => {
    if (socket && typeof socket.on === 'function') {
      // Xử lý khi nhận được yêu cầu cuộc gọi từ người khác
      const handleIncomingCall = () => {
        setIncomingCall(true); // Đánh dấu có cuộc gọi đến
      };

      // Đăng ký sự kiện 'incoming_call' từ server
      socket.on('incoming_call', handleIncomingCall);

      // Cleanup effect: Hủy đăng ký sự kiện khi component unmount
      return () => {
        socket.off('incoming_call', handleIncomingCall);
      };
    }
  }, [socket]); // Dependency là socket để đảm bảo chỉ đăng ký một lần khi socket thay đổi

  const handleCall = () => {
    setCalling(true);
    onStartCall();
  };

  const handleAcceptCall = () => {
    setCallAccepted(true);
    const id = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    setTimerId(id);
  };

  const handleEndCall = () => {
    setCalling(false);
    clearInterval(timerId);
    onStopCall();
  };

  useEffect(() => {
    if (callAccepted) {
      return () => {
        clearInterval(timerId);
      };
    }
  }, [callAccepted, timerId]);

  return (
    <div className='flex items-center gap-2'>
      {calling ? (
        callAccepted ? (
          <button className='cursor-pointer hover:text-red-600' onClick={handleEndCall}>
            <HiPhoneMissedCall size={20} />
          </button>
        ) : (
          <button className={`cursor-pointer hover:text-green-600 ${incomingCall ? 'text-red-600 animate-ping' : ''}`} onClick={handleAcceptCall}>
            Accept
          </button>
        )
      ) : (
        <button className={`cursor-pointer hover:text-primary ${incomingCall ? 'text-red-600 animate-ping' : ''}`} onClick={handleCall}>
          <HiPhoneOutgoing size={20} />
        </button>
      )}
      {calling && callAccepted && (
        <span className='text-xs'>Duration: {formatCallDuration(callDuration)}</span>
      )}
    </div>
  );
};

const formatCallDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
};

export default AudioCallButton;
