import React from 'react';

import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import Avatar from '../Avatar';

const OutgoingCallModal = ({ dataUser, calling, handleStopCall, handleToggleMic, isMicMuted }) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center '>
      <div className='bg-white p-4 rounded-lg shadow-lg flex flex-col items-center' style={{ width: '300px', height: '400px' }}>
        <h3 className='text-lg font-semibold mb-4'>Đang gọi...</h3>
        <Avatar width={50} height={50} imageUrl={dataUser?.profile_pic} name={dataUser?.name} userId={dataUser?._id} />
        <div className='flex gap-4 mt-auto'>
          <button className='bg-red-500 text-white px-4 py-2 rounded-lg mr-5' onClick={handleStopCall}>
            Kết thúc
          </button>
          <button className='bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center' onClick={handleToggleMic}>
            {isMicMuted ? <FaMicrophone color='#00ff00' size={24} /> : <FaMicrophoneSlash size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutgoingCallModal;
