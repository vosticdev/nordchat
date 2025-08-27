import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { LogOut, Plus, Shield } from 'lucide-react';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import CreateRoomModal from './CreateRoomModal';
import { encryptMessage } from '../utils/encryption';

interface User {
  username: string;
  userId: string;
}

interface Room {
  id: string;
  name: string;
  participants: string[];
  createdBy: string;
  createdAt: Date;
}

interface Message {
  id: string;
  sender: string;
  encryptedContent: string;
  timestamp: Date;
  type: string;
}

interface ChatProps {
  user: User;
  socket: Socket;
  token: string;
  keyPair: { publicKey: string; privateKey: string };
  onLogout: () => void;
}

const API_URL = 'http://localhost:5000';

const Chat: React.FC<ChatProps> = ({ user, socket, token, keyPair, onLogout }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('user-typing', (data: { user: string; roomId: string }) => {
        if (currentRoom && data.roomId === currentRoom.id) {
          setTypingUsers(prev => [...prev.filter(u => u !== data.user), data.user]);
        }
      });

      socket.on('user-stop-typing', (data: { user: string; roomId: string }) => {
        if (currentRoom && data.roomId === currentRoom.id) {
          setTypingUsers(prev => prev.filter(u => u !== data.user));
        }
      });

      return () => {
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [socket, currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const handleRoomSelect = async (room: Room) => {
    if (currentRoom) {
      socket.emit('leave-room', currentRoom.id);
    }
    
    setCurrentRoom(room);
    setMessages([]);
    setTypingUsers([]);
    socket.emit('join-room', room.id);
    
    // Load existing messages
    try {
      const response = await fetch(`${API_URL}/api/rooms/${room.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleCreateRoom = async (name: string, participants: string[]) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, participants })
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(prev => [...prev, data.room]);
        setShowCreateRoom(false);
        handleRoomSelect(data.room);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const handleSendMessage = (content: string) => {
    if (!currentRoom || !content.trim()) return;

    // Encrypt message for each participant
    const encryptedContent = encryptMessage(content, keyPair.privateKey);
    
    const message = {
      sender: user.username,
      type: 'text'
    };

    socket.emit('send-message', {
      roomId: currentRoom.id,
      message,
      encryptedContent
    });
  };

  const handleTyping = (isTyping: boolean) => {
    if (!currentRoom) return;

    if (isTyping) {
      socket.emit('typing', { user: user.username, roomId: currentRoom.id });
    } else {
      socket.emit('stop-typing', { user: user.username, roomId: currentRoom.id });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">NordChat</h1>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user.username}</p>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowCreateRoom(true)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          </div>

          <Sidebar
            rooms={rooms}
            currentRoom={currentRoom}
            onRoomSelect={handleRoomSelect}
            currentUser={user.username}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Room Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800">{currentRoom.name}</h2>
              <p className="text-sm text-gray-500">
                {currentRoom.participants.length} participants
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages}
                currentUser={user.username}
                keyPair={keyPair}
                typingUsers={typingUsers}
              />
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to NordChat</h3>
              <p className="text-gray-500">Select a chat room to start messaging securely</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreateRoom={handleCreateRoom}
          currentUser={user.username}
        />
      )}
    </div>
  );
};

export default Chat;
