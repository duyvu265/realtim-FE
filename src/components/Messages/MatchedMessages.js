import React from 'react';
import moment from 'moment';

const MatchedMessages = ({ messages, currentUserId }) => {
  if (!messages || messages.length === 0) {
    return <div className="p-4">Không có tin nhắn nào được tìm thấy.</div>;
  }

  return (
    <div className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50 rounded p-4">
      <h4 className="font-semibold mb-4">Tin nhắn tìm được:</h4>
      <div className="flex flex-col gap-2">
        {messages.map((msg) => {
          const isSender = msg.sender._id.toString() === currentUserId.toString();

          return (
            <div
              key={msg.message._id}
              className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-2 rounded max-w-[400px] md:max-w-lg lg:max-w-xl ${isSender ? 'bg-teal-100' : 'bg-white'
                  } whitespace-normal break-words border-b`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {!isSender && (
                    <>
                      <img
                        src={msg.sender.profile_pic || 'default_profile_pic.png'}
                        alt="Sender Profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{msg.sender.name || 'Người gửi'}</p>
                      </div>
                    </>
                  )}

                  {isSender && (
                    <>
                      <img
                        src={msg.sender.profile_pic || 'default_profile_pic.png'}
                        alt="Sender Profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{msg.sender.name || 'Bạn'}</p>
                      </div>
                    </>
                  )}
                </div>
                <p className="px-2">{msg.message.text || 'Nội dung không có'}</p>
                <p className="text-xs ml-auto w-fit">
                  {moment(msg.message.createdAt).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchedMessages;
