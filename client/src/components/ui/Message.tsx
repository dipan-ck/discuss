import React from 'react'
import { getAvatarColor, getUserInitials } from '@/lib/avatar'
import { useAuthStore } from '@/store/user.store'

function Message({msg}: {msg: any}) {

  const currentUser = useAuthStore((state) => state.user);

     // Format timestamp to readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    // If today, show time
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // If yesterday
    if (days === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    }
    
    // If within this year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Full date with year
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Check if this message is from the current user
  const isOwnMessage = currentUser?.username === msg.user.username;
  
  // Get avatar color only for own messages, otherwise use muted background
  const avatarColor = isOwnMessage 
    ? getAvatarColor(msg.user.id, currentUser?.profileColor) 
    : 'bg-muted';
  

  
    
  
  // Text color - white for colored avatars, foreground for muted
  const textColor = isOwnMessage ? 'text-white' : 'text-muted-foreground';
  
  const initials = getUserInitials(msg.user.username);

  return (
  <div 
            key={msg.id} 
            className="group flex gap-3 px-4 py-3 border-t border-border/40 hover:bg-muted/40 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center ${textColor} font-semibold text-sm flex-shrink-0 shadow-md`}>
              {initials}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-medium text-xs text-foreground hover:underline cursor-pointer">
                  {msg.user.username}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  {formatTimestamp(msg.createdAt)}
                </span>
              </div>
              <div className="text-foreground/90 break-words leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
  )
}

export default Message