import React, { useEffect, useRef } from 'react';
import { Shield, User } from 'lucide-react';
import { decryptMessage } from '../utils/encryption';
import clsx from 'clsx';

interface Message {
  id: string;
  sender: string;
  encryptedContent: string;
  timestamp: Date;
  type: string;
}

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  keyPair: { publicKey: string; privateKey: string };
  typingUsers: string[];
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser, keyPair, typingUsers }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const decryptAndDisplayMessage = (encryptedContent: string) => {
    try {
      const decrypted = decryptMessage(encryptedContent, keyPair.privateKey);
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return '🔒 Encrypted message (decryption failed)';
    }
  };

  const isOwnMessage = (message: Message) => message.sender === currentUser;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start a conversation to see messages here</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              'flex',
              isOwnMessage(message) ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={clsx(
                'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                'flex items-start space-x-2',
                isOwnMessage(message)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              )}
            >
              {!isOwnMessage(message) && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                {!isOwnMessage(message) && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {message.sender}
                  </p>
                )}
                
                <div className="flex items-center space-x-2">
                  <p className="text-sm break-words">
                    {decryptAndDisplayMessage(message.encryptedContent)}
                  </p>
                  <Shield className="w-3 h-3 opacity-50 flex-shrink-0" />
                </div>
                
                <p className={clsx(
                  'text-xs mt-1',
                  isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500'
                )}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span className="text-sm text-gray-600">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
