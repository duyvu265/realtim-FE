import React, { useState, useEffect } from 'react';
import { HiPhoneOutgoing, HiPhoneMissedCall } from "react-icons/hi";
import useWebRTC from './useWebRTC';

const AudioCallButton = ({ onStartCall, onStopCall, socket }) => {
  const { calling, callAccepted, startCall, endCall } = useWebRTC(socket);
  const [callDuration, setCallDuration] = useState(0);
  const [timerId, setTimerId] = useState(null);

  const handleCall = () => {
    startCall();
    onStartCall();
  };

  const handleEndCall = () => {
    endCall();
    onStopCall();
  };

  useEffect(() => {
    if (callAccepted) {
      const id = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setTimerId(id);

      return () => {
        clearInterval(id);
      };
    }
  }, [callAccepted]);

  return (
    <div className='flex items-center gap-2'>
      {callAccepted ? (
        <button className='cursor-pointer hover:text-red-600' onClick={handleEndCall}>
          <HiPhoneMissedCall size={20} />
        </button>
      ) : (
        <button className='cursor-pointer hover:text-primary' onClick={handleCall}>
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
