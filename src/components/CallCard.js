import React from 'react';
import moment from 'moment';
import { HiPhoneOutgoing, HiVideoCamera } from 'react-icons/hi';

const CallCard = ({ call }) => {
  return (
    <div className={`p-2 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${call.type === 'video' ? 'bg-purple-100' : (call.status === 'missed' ? 'bg-red-100' : 'bg-green-100')} ml-auto`}>
      <div className='flex items-center'>
        {call.type === 'video' ? <HiVideoCamera className='mr-2' /> : <HiPhoneOutgoing className='mr-2' />}
        <p className='text-sm'>{call.type === 'video' ? 'Video call' : (call.status === 'missed' ? 'Missed call' : 'Completed call')}</p>
      </div>
      <p className='text-xs'>{moment(call.time).format('hh:mm')}</p>
      {call.duration && <p className='text-xs'>Duration: {call.duration} seconds</p>}
    </div>
  );
};

export default CallCard;
