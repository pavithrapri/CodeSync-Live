import { X } from 'lucide-react';

interface UserPresenceProps {
  users: any[];
  onClose: () => void;
}

export default function UserPresence({ users, onClose }: UserPresenceProps) {
  const getUserColor = (username: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-purple-500',
      'bg-orange-500',
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[250px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Active Members ({users.length})</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {users.map((user: any, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full ${getUserColor(user.username)} flex items-center justify-center text-white text-xs font-semibold`}
            >
              {getInitials(user.username)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active members
          </p>
        )}
      </div>
    </div>
  );
}