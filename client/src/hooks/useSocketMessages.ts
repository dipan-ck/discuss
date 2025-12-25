import { useEffect, useRef } from "react";
import socket from "@/lib/socket";
import { useMessageStore } from "@/store/message.store";

interface UseSocketMessagesProps {
  channelId: string | undefined;
  onNewMessage?: () => void;
}

export function useSocketMessages({
  channelId,
  onNewMessage,
}: UseSocketMessagesProps) {
  const { appendMessage } = useMessageStore();
  const joinedChannels = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!channelId) return;

    // Join this channel only if not already joined
    if (!joinedChannels.current.has(channelId)) {
      socket.emit("channel:join", channelId);
      joinedChannels.current.add(channelId);
    }

    const handleNewMessage = (message: any) => {
      appendMessage(message.channelId, message);
      onNewMessage?.();
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [channelId, appendMessage, onNewMessage]);
}
