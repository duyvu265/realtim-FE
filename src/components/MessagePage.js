import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Avatar from './Avatar';
import { HiSearch, HiDotsVertical } from 'react-icons/hi';
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from 'react-icons/fa';
import uploadFile from '../helpers/uploadFile';
import { IoClose } from 'react-icons/io5';
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg';
import { IoMdSend } from 'react-icons/io';
import moment from 'moment';
import CallCard from './CallCard';
import VideoCallButton from './VideoCall/VideoCallButton';
import useWebRTC from './Call/useWebRTC';
import AudioCallButton from './Call/AudioCallButton';
import toast from 'react-hot-toast';
import CustomEmojiPicker from './Emoji/CustomEmojiPicker';

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
  const [loadingMessages, setLoadingMessages] = useState(false); // State để theo dõi trạng thái tải tin nhắn
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
        setLoadingMessages(false); // Đã tải xong tin nhắn
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
      setLoading(true); // Bắt đầu tải tin nhắn mới
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
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    callAccepted,
    startCall,
    acceptCall,
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
    acceptCall();
  };

  const combinedMessages = [...allMessage, ...callHistory].sort((a, b) => {
    return new Date(a.createdAt || a.time) - new Date(b.createdAt || b.time);
  });

  const onEmojiClick = (e) => {
    setMessage(prevMessage => ({
      ...prevMessage,
      text: prevMessage.text + e.emoji
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
      <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50'>
        <div className='flex flex-col gap-2 py-2 mx-2'>
          {combinedMessages.map((item, index) => {
            if (item.text || item.imageUrl || item.videoUrl) {
              return (
                <div
                  key={index}
                  className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === item?.msgByUserId ? 'ml-auto bg-teal-100' : 'bg-white'} whitespace-normal break-words`}
                >
                  <div className='w-full relative'>
                    {item?.imageUrl && <img src={item?.imageUrl} className='w-full h-full object-scale-down' alt='Uploaded' />}
                    {item?.videoUrl && <video src={item.videoUrl} className='w-full h-full object-scale-down' controls muted autoPlay />}
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
      <footer className='h-16 bg-white flex justify-between items-center'>
        <div className='w-full flex items-center'>
          <div className='relative'>
            <FaPlus size={20} className='cursor-pointer mx-4 hover:text-primary' onClick={() => setOpenImageVideoUpload(!openImageVideoUpload)} />
            {openImageVideoUpload && (
              <div className='w-fit h-fit bg-white p-4 rounded shadow-lg absolute bottom-14 left-6 flex items-center'>
                <div className='flex flex-col items-center gap-2 cursor-pointer hover:text-primary'>
                  <input type='file' accept='image/*' className='hidden' id='image-upload' onChange={handleUploadImage} />
                  <label htmlFor='image-upload'>
                    <FaImage size={20} />
                  </label>
                  <p>Ảnh</p>
                </div>
                <div className='flex flex-col items-center gap-2 ml-6 cursor-pointer hover:text-primary'>
                  <input type='file' accept='video/*' className='hidden' id='video-upload' onChange={handleUploadVideo} />
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
          {showEmojiPicker && <CustomEmojiPicker onEmojiClick={(e) => {
            onEmojiClick(e)
          }} />}
          <form className='flex items-center w-full h-full' onSubmit={handleSendMessage}>
            <input
              type='text'
              name='text'
              placeholder='Nhập tin nhắn'
              className='w-full outline-none border-none'
              onChange={handleOnChange}
              value={message.text}
              maxLength={2000}
            />
            <button type='submit' className='bg-primary text-white h-full p-4 cursor-pointer'>
              <IoMdSend />
            </button>
          </form>
        </div>
      </footer>
      {showReceiverModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
          <div className='bg-white p-4 rounded-lg shadow-lg flex flex-col items-center'>
            <h3 className='text-lg font-semibold mb-4'>Bạn có cuộc gọi đến từ {incomingCall?.callerName}</h3>
            <div className='flex gap-4'>
              <button className='bg-green-500 text-white px-4 py-2 rounded-lg' onClick={handleListen}>
                Nghe
              </button>
              <button className='bg-red-500 text-white px-4 py-2 rounded-lg' onClick={handleCancelCall}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {calling && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
          <div className='bg-white p-4 rounded-lg shadow-lg flex flex-col items-center'>
            <h3 className='text-lg font-semibold mb-4'>Đang gọi...</h3>
            <div className='flex gap-4'>
              <button className='bg-red-500 text-white px-4 py-2 rounded-lg' onClick={handleStopCall}>
                Kết thúc
              </button>
              <button className='bg-gray-500 text-white px-4 py-2 rounded-lg' onClick={handleToggleMic}>
                {isMicMuted ? 'Bật mic' : 'Tắt mic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
