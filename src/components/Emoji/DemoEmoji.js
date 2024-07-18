import React, { useState } from 'react';
import Picker from 'emoji-picker-react';

const CustomEmojiPicker = () => {
  const [chosenEmoji, setChosenEmoji] = useState(null);

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject.emoji);
  };

  return (
    <div>
      {chosenEmoji ? (
        <span>You chose: {chosenEmoji}</span>
      ) : (
        <span>No emoji Chosen</span>
      )}
      <Picker onEmojiClick={onEmojiClick} />
    </div>
  );
};
export default CustomEmojiPicker;