import React from 'react';
import Avatar from '../Avatar';


const IncomingCallModal = ({ incomingCall, handleListen, handleCancelCall }) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
      <div className='bg-white p-4 rounded-lg shadow-lg flex flex-col items-center' style={{ width: '300px', height: '400px' }}>
        <h3 className='text-lg font-semibold mb-4'>Bạn có cuộc gọi đến từ {incomingCall?.callerName}</h3>
        <Avatar width={50} height={50} imageUrl={incomingCall?.callerProfilePic} name={incomingCall?.callerName} userId={incomingCall?.callerId} />
        <div className='flex gap-4 mt-auto '>
          <button className='bg-green-500 text-white px-4 py-2 rounded-lg' onClick={handleListen}>
            Nghe
          </button>
          <button className='bg-red-500 text-white px-4 py-2 rounded-lg' onClick={handleCancelCall}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
