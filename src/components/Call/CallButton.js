import React, { useState } from 'react';
import { HiPhoneOutgoing } from "react-icons/hi";
import moment from 'moment';

const AudioCallButton = ({ onStartCall }) => {
  const [calling, setCalling] = useState(false);

  const handleCall = () => {
    setCalling(true);
    onStartCall();
    // Đoạn mã này để giả định việc gọi, bạn có thể thêm logic thực tế cho gọi điện thoại ở đây.
    setTimeout(() => {
      setCalling(false);
    }, 3000); // Giả định cuộc gọi kéo dài 3 giây
  };

  return (
    <button className='cursor-pointer hover:text-primary mr-6' onClick={handleCall}>
      {calling ? 'Calling...' : <HiPhoneOutgoing />}
    </button>
  );
};

export default AudioCallButton;
