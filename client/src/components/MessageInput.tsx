"use client";

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, Plus, Smile } from 'lucide-react';
import socket from '@/lib/socket';
import { useUiStore } from '@/store/ui.store';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface MessageInputProps {
  channelName: string;
}

function MessageInput({ channelName }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const selectedChannel = useUiStore(s => s.selectedChannel);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
  };


  const handleSend = () => {
    if (message.trim() && selectedChannel?.id) {
      socket.emit("message:send", {channelId: selectedChannel.id, content: message.trim()});
      setMessage(''); // Clear input after sending
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      
    }
  };

  return (
    <div className="flex-1 bg-muted/15 p-2 relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-16 right-4 z-50">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
      
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Message #${channelName}`}
        className="min-h-[70px] max-h-[200px] resize-none pr-20 py-3 bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/10 rounded-lg transition-all"
        rows={1}
      />
      
      {/* Emoji button inside textarea */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        type="button"
        className="absolute right-11 bottom-2 h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Smile className="h-4 w-4" />
      </Button>

      {/* Send button inside textarea */}
      <Button
        onClick={handleSend}
        disabled={!message.trim()}
        size="icon"
        className="absolute right-4 top-1/2 bottom-2 h-7 w-7 shrink-0 transition-all disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default MessageInput;
