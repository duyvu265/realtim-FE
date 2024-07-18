// MessagePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Avatar from './Avatar';
import { HiSearch, HiDotsVertical } from 'react-icons/hi';
import { FaAngleLeft } from 'react-icons/fa';
import uploadFile from '../helpers/uploadFile';
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg';
import VideoCallButton from './VideoCall/VideoCallButton';
import useWebRTC from './Call/useWebRTC';
import AudioCallButton from './Call/AudioCallButton';
import toast from 'react-hot-toast';

import IncomingCallModal from './CallModal/IncomingCallModal';
import OutgoingCallModal from './CallModal/OutgoingCallModal';
import MessagesSection from './Messages/MessagesSection';
import MessagesFooter from './Messages/MessagesFooter';


const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const user = useSelector((state) => state?.user);
  const [dataUser, setDataUser] = useState({
    name: '',
    email: '',
    profile_pic: '',
    online: false,
    _id: '',
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: '',
    imageUrl: '',
    videoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [calling, setCalling] = useState(false);
  const [showReceiverModal, setShowReceiverModal] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);

      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });

      socketConnection.on('message', (data) => {
        setAllMessage(data);
        setLoadingMessages(false);
      });

      socketConnection.on('incoming-call', (data) => {
        setIncomingCall(data);
        setShowReceiverModal(true);
        toast.success('Bạn có cuộc gọi đến!');
      });

      return () => {
        socketConnection.off('message-user');
        socketConnection.off('message');
        socketConnection.off('incoming-call');
      };
    }
  }, [socketConnection, params.userId]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessage, callHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
      setLoading(true);
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user?._id,
          receiver: params.userId,
          ...message,
          msgByUserId: user?._id,
        });
        setMessage({
          text: '',
          imageUrl: '',
          videoUrl: '',
        });
      }
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    try {
      const uploadPhoto = await uploadFile(file);
      setMessage((prev) => ({ ...prev, imageUrl: uploadPhoto.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
      setOpenImageVideoUpload(false);
    }
  };

  const handleClearUploadImage = () => {
    setMessage((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleClearUploadVideo = () => {
    setMessage((prev) => ({ ...prev, videoUrl: '' }));
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    try {
      const uploadResult = await uploadFile(file);
      setMessage((prev) => ({ ...prev, videoUrl: uploadResult.url }));
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setLoading(false);
      setOpenImageVideoUpload(false);
    }
  };

  const {
    startCall,
    endCall,
    handleToggleMic,
    isMicMuted,
  } = useWebRTC(socketConnection, user, dataUser);

  const handleStartCall = () => {
    setCalling(true);
    startCall();
  };

  const handleStopCall = () => {
    setCalling(false);
    endCall();
  };

  const handleCancelCall = () => {
    setCalling(false);
    endCall();
  };

  const handleListen = () => {
    setShowReceiverModal(false);
  };

  const combinedMessages = [...allMessage, ...callHistory].sort((a, b) => {
    return new Date(a.createdAt || a.time) - new Date(b.createdAt || b.time);
  });

  const onEmojiClick = (e) => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      text: prevMessage.text + e.emoji,
    }));
  };

  if (loadingMessages) {
    return <Loading />;
  }

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='bg-no-repeat bg-cover'>
      <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
        <div className='flex items-center gap-4'>
          <Link to={'/'} className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar width={50} height={50} imageUrl={dataUser?.profile_pic} name={dataUser?.name} userId={dataUser?._id} />
          </div>
          <div>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
            <p className='-my-2 text-sm'>{dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-400'>offline</span>}</p>
          </div>
        </div>

        <div>
          <button className='cursor-pointer hover:text-primary mr-6'>
            <AudioCallButton
              onStartCall={handleStartCall}
              onStopCall={handleStopCall}
              socket={socketConnection}
            />
          </button>
          <VideoCallButton socket={socketConnection} />
          <button className='cursor-pointer hover:text-primary mr-6'>
            <HiSearch />
          </button>
          <button className='cursor-pointer hover:text-primary mr-6'>
            <HiDotsVertical />
          </button>
        </div>
      </header>

      <MessagesSection
        combinedMessages={combinedMessages}
        user={user}
        messagesEndRef={messagesEndRef}
        message={message}
        handleClearUploadImage={handleClearUploadImage}
        handleClearUploadVideo={handleClearUploadVideo}
      />

      <MessagesFooter
        openImageVideoUpload={openImageVideoUpload}
        setOpenImageVideoUpload={setOpenImageVideoUpload}
        handleUploadImage={handleUploadImage}
        handleUploadVideo={handleUploadVideo}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        onEmojiClick={onEmojiClick}
        handleSendMessage={handleSendMessage}
        message={message}
        handleOnChange={handleOnChange}
      />

      {showReceiverModal && (
        <IncomingCallModal
          incomingCall={incomingCall}
          handleListen={handleListen}
          handleCancelCall={handleCancelCall}
        />
      )}
      {calling && (
        <OutgoingCallModal
          dataUser={dataUser}
          calling={calling}
          handleStopCall={handleStopCall}
          handleToggleMic={handleToggleMic}
          isMicMuted={isMicMuted}
        />
      )}
    </div>
  );
};

export default MessagePage;
