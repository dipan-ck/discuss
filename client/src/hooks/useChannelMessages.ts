import { useEffect, useRef } from "react";
import { useMessageStore } from "@/store/message.store";

const INITIAL_MESSAGE_LIMIT = 30;

export function useChannelMessages(channelId: string | undefined) {
  const { messagesByChannel, fetchMessages } = useMessageStore();
  const hasInitiallyLoaded = useRef<Set<string>>(new Set());
  const prevChannelId = useRef<string | null>(null);

  useEffect(() => {
    if (!channelId) return;

    const existingMessages = messagesByChannel[channelId];

    // Reset state when switching channels
    if (prevChannelId.current !== channelId) {
      prevChannelId.current = channelId;
    }

    // Only fetch if we don't have messages for this channel yet
    if (!existingMessages || existingMessages.length === 0) {
      if (!hasInitiallyLoaded.current.has(channelId)) {
        hasInitiallyLoaded.current.add(channelId);
        fetchMessages(channelId, INITIAL_MESSAGE_LIMIT);
      }
    }
  }, [channelId, messagesByChannel, fetchMessages]);
}
