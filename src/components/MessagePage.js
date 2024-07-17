import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);

      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });

      socketConnection.on('message', (data) => {
        setAllMessage(data);
      });

      socketConnection.on('incoming-call', (data) => {
        setIncomingCall(data);
        setShowReceiverModal(true);
      });

      return () => {
        socketConnection.off('message-user');
        socketConnection.off('message');
        socketConnection.off('incoming-call');
      };
    }
  }, [socketConnection, params.userId]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
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
          <VideoCallButton  socket={socketConnection} />
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
                  className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === item?.msgByUserId ? 'ml-auto bg-teal-100' : 'bg-white'}`}
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
        </div>

        {message.imageUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadImage}>
              <IoClose size={30} />
            </div>
            <div className='bg-white p-3'>
              <img src={message.imageUrl} alt='Uploaded Image' className='aspect-square w-full h-full max-w-sm m-2 object-scale-down' />
            </div>
          </div>
        )}

        {message.videoUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadVideo}>
              <IoClose size={30} />
            </div>
            <div className='bg-white p-3'>
              <video src={message.videoUrl} className='aspect-square w-full h-full max-w-sm m-2 object-scale-down' controls muted autoPlay />
            </div>
          </div>
        )}
      </section>
      {loading && (
        <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
          <Loading />
        </div>
      )}
      <section className='h-16 bg-white flex items-center px-4'>
        <div className='relative'>
          <button onClick={() => setOpenImageVideoUpload((prev) => !prev)} className='flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white'>
            <FaPlus size={20} />
          </button>

          {openImageVideoUpload && (
            <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2'>
              <form>
                <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                  <div className='text-primary'>
                    <FaImage size={18} />
                  </div>
                  <p>Image</p>
                </label>
                <input
                  type='file'
                  id='uploadImage'
                  className='hidden'
                  onChange={handleUploadImage}
                />
                <label htmlFor='uploadVideo' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                  <div className='text-primary'>
                    <FaVideo size={18} />
                  </div>
                  <p>Video</p>
                </label>
                <input
                  type='file'
                  id='uploadVideo'
                  className='hidden'
                  onChange={handleUploadVideo}
                />
              </form>
            </div>
          )}
        </div>
        <form className='flex flex-grow mx-4' onSubmit={handleSendMessage}>
          <input
            type='text'
            name='text'
            value={message.text}
            onChange={handleOnChange}
            className='flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none'
            placeholder='Type a message...'
          />
          <button
            type='submit'
            className='flex items-center justify-center p-2 bg-primary text-white rounded-r-lg hover:bg-primary-dark focus:outline-none'
          >
            <IoMdSend size={20} />
          </button>
        </form>
      </section>

      {calling && (
        <div className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50'>
          <div className='bg-white p-4 rounded-lg'>
            <h2 className='text-lg font-semibold'>{dataUser.name} is calling...</h2>
            <div className='flex justify-center gap-4 mt-4'>
              <button className='bg-primary text-white p-2 rounded-lg hover:bg-primary-dark' onClick={handleToggleMic}>
                {isMicMuted ? 'MicMuted' : 'MicUnmuted'}
              </button>
              <button className='bg-red-500 text-white p-2 rounded-lg hover:bg-red-600' onClick={handleCancelCall}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiverModal && (
        <div className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50'>
          <div className='bg-white p-4 rounded-lg'>
            <h2 className='text-lg font-semibold'>Incoming Call from {dataUser.name}</h2>
            <div className='flex justify-center gap-4 mt-4'>
              <button className='bg-primary text-white p-2 rounded-lg hover:bg-primary-dark' onClick={handleListen}>
                Listen
              </button>
              <button className='bg-red-500 text-white p-2 rounded-lg hover:bg-red-600' onClick={() => setShowReceiverModal(false)}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
