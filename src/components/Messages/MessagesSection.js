// MessagesSection.js
import React, { useEffect, useRef } from 'react';
import moment from 'moment';
import { IoClose } from 'react-icons/io5';
import CallCard from '../CallCard';

const MessagesSection = ({
  combinedMessages,
  user,
  messagesEndRef,
  message,
  handleClearUploadImage,
  handleClearUploadVideo,
}) => {
  useEffect(() => {
    scrollToBottom();
  }, [combinedMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50'>
      <div className='flex flex-col gap-2 py-2 mx-2'>
        {combinedMessages.map((item, index) => {
          if (item.text || item.imageUrl || item.videoUrl) {
            return (
              <div
                key={index}
                className={`p-1 py-1 rounded w-fit max-w-[400px] md:max-w-lg lg:max-w-xl ${
                  user._id === item?.msgByUserId ? 'ml-auto bg-teal-100' : 'bg-white'
                } whitespace-normal break-words`}
              >
                <div className='w-full relative'>
                  {item?.imageUrl && (
                    <img src={item?.imageUrl} className='w-full h-full object-scale-down' alt='Uploaded' />
                  )}
                  {item?.videoUrl && (
                    <video src={item.videoUrl} className='w-full h-full object-scale-down' controls muted autoPlay />
                  )}
                </div>
                <p className='px-2'>{item.text}</p>
                <p className='text-xs ml-auto w-fit'>{moment(item.createdAt).format('hh:mm')}</p>
              </div>
            );
          } else {
            return <CallCard key={index} call={item} />;
          }
        })}
        <div ref={messagesEndRef} />
      </div>

      {message.imageUrl && (
        <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
          <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadImage}>
            <IoClose size={20} />
          </div>
          <img src={message.imageUrl} alt='Upload preview' className='w-full h-full object-cover' />
        </div>
      )}

      {message.videoUrl && (
        <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
          <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadVideo}>
            <IoClose size={20} />
          </div>
          <video src={message.videoUrl} className='w-full h-full object-cover' controls autoPlay />
        </div>
      )}
    </section>
  );
};

export default MessagesSection;
