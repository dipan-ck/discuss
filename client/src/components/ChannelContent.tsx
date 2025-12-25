"use client";

import { useUiStore } from "@/store/ui.store";
import { useMessageStore } from "@/store/message.store";
import { useRef } from "react";
import MessageInput from "./MessageInput";
import { MessageList } from "./MessageList";
import { NoChannelSelected } from "./NoChannelSelected";
import { EmptyChannelState } from "./EmptyChannelState";
import { ErrorLoadingMessages } from "./ErrorLoadingMessages";
import { useChannelMessages } from "@/hooks/useChannelMessages";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useSocketMessages } from "@/hooks/useSocketMessages";

const INITIAL_MESSAGE_LIMIT = 30;

function ChannelContent() {
  const selectedChannel = useUiStore((s) => s.selectedChannel);
  const { messagesByChannel, cursorByChannel, isLoadingByChannel, errorByChannel, fetchMessages } = useMessageStore();

  const messages = selectedChannel ? messagesByChannel[selectedChannel.id] || [] : [];
  const nextCursor = selectedChannel ? cursorByChannel[selectedChannel.id] : null;
  const isLoading = selectedChannel ? isLoadingByChannel[selectedChannel.id] || false : false;
  const error = selectedChannel ? errorByChannel[selectedChannel.id] : null;

  const containerRef = useRef<HTMLDivElement>(null);

  // Custom hooks for better organization
  useChannelMessages(selectedChannel?.id);
  
  const { isNearBottom, scrollToBottom } = useAutoScroll({
    containerRef,
    messages,
    isLoading,
  });

  const { isLoadingMore } = useInfiniteScroll({
    channelId: selectedChannel?.id,
    containerRef,
    hasNextPage: !!nextCursor,
  });

  useSocketMessages({
    channelId: selectedChannel?.id,
    onNewMessage: () => {
      requestAnimationFrame(() => {
        if (isNearBottom()) scrollToBottom();
      });
    },
  });





  // No channel selected
  if (!selectedChannel) {
    return <NoChannelSelected />;
  }

  // Error state
  if (error && messages.length === 0) {
    return (
      <ErrorLoadingMessages
        error={error}
        onRetry={() => fetchMessages(selectedChannel.id, INITIAL_MESSAGE_LIMIT)}
      />
    );
  }

  // Empty channel (no messages)
  if (!isLoading && messages.length === 0) {
    return <EmptyChannelState channelName={selectedChannel.name} />;
  }

  return (
    <div className="flex-1 h-[calc(100vh-1rem)] m-1 rounded-lg custom-scrollbar border border-border bg-muted/15 overflow-hidden flex flex-col">
      <MessageList
        ref={containerRef}
        messages={messages}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
      />
      
      <div>
        <MessageInput channelName={selectedChannel.name} />
      </div>
    </div>
  );
}


export default ChannelContent;