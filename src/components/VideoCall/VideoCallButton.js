import React, { useState } from 'react';
import { HiVideoCamera } from "react-icons/hi";
import VideoCall from './VideoCall';


const VideoCallButton = () => {
  const [isCalling, setIsCalling] = useState(false);

  const handleVideoCallClick = () => {
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  return (
    <>
      <button className='cursor-pointer hover:text-primary mr-6' onClick={handleVideoCallClick}>
        <HiVideoCamera />
      </button>
      {isCalling && <VideoCall onEndCall={handleEndCall} />}
    </>
  );
};

export default VideoCallButton;
