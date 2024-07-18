
import React from 'react';
import { FaPlus, FaImage, FaVideo } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import CustomEmojiPicker from '../Emoji/CustomEmojiPicker';

const MessagesFooter = ({
  openImageVideoUpload,
  setOpenImageVideoUpload,
  handleUploadImage,
  handleUploadVideo,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
  handleSendMessage,
  message,
  handleOnChange,
}) => {
  return (
    <footer className='h-16 bg-white flex justify-between items-center'>
      <div className='w-full flex items-center'>
        <div className='relative'>
          <FaPlus
            size={20}
            className='cursor-pointer mx-4 hover:text-primary'
            onClick={() => setOpenImageVideoUpload(!openImageVideoUpload)}
          />
          {openImageVideoUpload && (
            <div className='w-fit h-fit bg-white p-4 rounded shadow-lg absolute bottom-14 left-6 flex items-center'>
              <div className='flex flex-col items-center gap-2 cursor-pointer hover:text-primary'>
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  id='image-upload'
                  onChange={handleUploadImage}
                />
                <label htmlFor='image-upload'>
                  <FaImage size={20} />
                </label>
                <p>Ảnh</p>
              </div>
              <div className='flex flex-col items-center gap-2 ml-6 cursor-pointer hover:text-primary'>
                <input
                  type='file'
                  accept='video/*'
                  className='hidden'
                  id='video-upload'
                  onChange={handleUploadVideo}
                />
                <label htmlFor='video-upload'>
                  <FaVideo size={20} />
                </label>
                <p>Video</p>
              </div>
            </div>
          )}
        </div>
        <button
          type='button'
          className=' text-white h-full p-4 cursor-pointer'
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          😊
        </button>
        {showEmojiPicker && <CustomEmojiPicker onEmojiClick={onEmojiClick} />}
        <form className='flex items-center w-full h-full' onSubmit={handleSendMessage}>
          <input
            type='text'
            name='text'
            placeholder='Nhập tin nhắn'
            className='w-full outline-none border-none pr-6'
            onChange={handleOnChange}
            value={message.text}
            maxLength={2000}
          />
          <button type='submit' className='bg-primary text-white h-full p-4 ml-4 mr-4 cursor-pointer'>
            <IoMdSend />
          </button>
        </form>
      </div>
    </footer>
  );
};

export default MessagesFooter;
