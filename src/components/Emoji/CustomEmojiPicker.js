
import React from 'react';
import EmojiPicker from 'emoji-picker-react';

const CustomEmojiPicker = ({ onEmojiClick }) => {
  return (
    <div className='absolute bottom-16 left-900 z-10'>
      <EmojiPicker onEmojiClick={onEmojiClick} />
    </div>
  );
};

export default CustomEmojiPicker;
