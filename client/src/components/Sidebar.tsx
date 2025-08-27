import React from 'react';
import { MessageCircle, Users } from 'lucide-react';
import clsx from 'clsx';

interface Room {
  id: string;
  name: string;
  participants: string[];
  createdBy: string;
  createdAt: Date;
}

interface SidebarProps {
  rooms: Room[];
  currentRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  currentUser: string;
}

const Sidebar: React.FC<SidebarProps> = ({ rooms, currentRoom, onRoomSelect, currentUser }) => {
  const formatRoomName = (room: Room) => {
    if (room.participants.length === 2) {
      return room.participants.find(p => p !== currentUser) || room.name;
    }
    return room.name;
  };

  const formatLastMessage = (room: Room) => {
    const otherParticipants = room.participants.filter(p => p !== currentUser);
    if (otherParticipants.length === 1) {
      return `Chat with ${otherParticipants[0]}`;
    } else if (otherParticipants.length > 1) {
      return `${otherParticipants.length} participants`;
    }
    return 'No participants';
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {rooms.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No chat rooms yet</p>
          <p className="text-sm">Create a new chat to get started</p>
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room)}
              className={clsx(
                'w-full text-left p-3 rounded-lg transition-colors duration-200',
                'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                currentRoom?.id === room.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-white border border-transparent'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={clsx(
                  'p-2 rounded-full',
                  currentRoom?.id === room.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {room.participants.length > 2 ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={clsx(
                    'text-sm font-medium truncate',
                    currentRoom?.id === room.id
                      ? 'text-blue-900'
                      : 'text-gray-900'
                  )}>
                    {formatRoomName(room)}
                  </h3>
                  <p className={clsx(
                    'text-xs truncate',
                    currentRoom?.id === room.id
                      ? 'text-blue-700'
                      : 'text-gray-500'
                  )}>
                    {formatLastMessage(room)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
