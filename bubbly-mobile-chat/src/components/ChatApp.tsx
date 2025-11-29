
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, LogOut, User, ArrowLeft } from 'lucide-react';
import axiosInstance from '@/axiosInstance';
import socket from '@/socket';
import { useSelector } from 'react-redux';
import { RootState } from "../store";

interface Message {
  _id: number;
  senderId: string;
  message: string;
  sender: 'user' | 'other';
  timestamp: Date;
}
interface Profile {
  url: string;
  profilePublicId: string;
}

interface ChatUser {
  id: number;
  name: string;
  status: 'online' | 'offline';
  userId: string
  profile:Profile
}

interface ChatAppProps {
  selectedUser: ChatUser;
  onBack: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
}

interface MessagePayload {
  senderId: string;
  recreceiverId: string;
  recieverName?: string; // optional if userDetails?.username can be undefined
  roomId: string;
  message: string;
  messageType: "text" | "image" | "file"; // if you have multiple types
  fileUrl: string | null;
  seen: boolean;
  seenAt: string | null;
}

const ChatApp: React.FC<ChatAppProps> = ({ selectedUser, onBack, onLogout, onProfileClick }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const receiveSound = new Audio("/happy-pop-3-185288.mp3");
  const sendSound = new Audio("/message-envoye-iphone-apple-391098.mp3");
  const senderId = localStorage.getItem("userId")
  const userDetails = useSelector((state:RootState) => state?.userReducer?.user)
  const getAllMessages = async () => {
    try {
      const res = await axiosInstance.get(`/fetchmessages?senderId=${senderId}&receiverId=${selectedUser.userId}`)
      if (res.status === 200) {
        setMessages(res.data.messages)
      } else {
        setMessages([])
      }
    } catch (error) {
      setMessages([])
      console.log(error)
    }
  }

  useEffect(() => {
    getAllMessages()
  }, [])



  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onUsers, setOnusers] = useState([])
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const roomId = [senderId, selectedUser.userId].sort().join("_");
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  console.log("roomId", roomId)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const json:MessagePayload = {
      senderId: senderId,
      recreceiverId: selectedUser.userId,
      recieverName: userDetails?.username,
      roomId: roomId,
      message: newMessage,
      messageType: "text",
      fileUrl: null,
      seen: false,
      seenAt: null,
    }
    socket.emit('sendMessage', json)
    const res = await axiosInstance.post(`/sendmessage?senderId=${senderId}&receiverId=${selectedUser?.userId}`, json)
    if (res.status === 201) {
      sendSound.play()
    }
    setNewMessage("")
  };
  const handleTyping = () => {
    socket.emit("typing", { roomId, userId: senderId });

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    typingTimer.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId, userId: senderId });
    }, 700);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  useEffect(() => {
    if (!senderId) return;
    socket.emit("online", senderId);
  }, [senderId]);

  useEffect(() => {
    socket.on("typing", ({ userId }) => {
      setTypingUser(userId);
    });

    socket.on("stopTyping", ({ userId }) => {
      setTypingUser(null);
    });
    socket.on("updateStatus", ({ userId, status, onUsers }) => {
      setOnusers(onUsers)
    });


    return () => {
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("updateStatus");
    };
  }, []);

  useEffect(() => {
    socket.emit("joinRoom", roomId);
    socket.on('receiveMessage', (data) => {
      console.log("data", data)
      setMessages(prev => [...prev, data]);
      if (data.senderId !== senderId) {
        receiveSound.play();
      }
    })
  }, [])
  useEffect(() => {
    if (senderId) {
      socket.emit("joinUser", senderId);
    }
  }, [senderId]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {selectedUser?.profile?.url ? (
                <img
                  src={selectedUser.profile.url}
                  alt={selectedUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-600" />
              )}
              {/* <User className="w-6 h-6" /> */}
            </div>
            <div style={{ cursor: "pointer" }} onClick={onProfileClick}>
              <h2 className="font-semibold">{selectedUser.name}</h2>
              <p className="text-sm text-white/80 capitalize">
                {typingUser === selectedUser.userId
                  ? "typing..."
                  : onUsers?.includes(selectedUser.userId)
                    ? "Online"
                    : "Offline"}
              </p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.senderId === senderId ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${message.senderId === senderId
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
                }`}
            >
              <p className="text-sm">{message.message}</p>
              <p
                className={`text-xs mt-1 ${message.senderId === senderId ? 'text-blue-100' : 'text-gray-500'
                  }`}
              >
                {/* {formatTime(message.createdAt)} */}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              const text = e.target.value;
              setNewMessage(text);
              if (text.trim() === "") {
                socket.emit("stopTyping", { roomId, userId: senderId });
                return;
              }
              handleTyping();
            }}
            className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            type="submit"
            className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 transition-all duration-200 hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatApp;
