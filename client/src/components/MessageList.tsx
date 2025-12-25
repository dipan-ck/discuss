import { forwardRef } from "react";
import Message from "./ui/Message";

interface MessageListProps {
  messages: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isLoading, isLoadingMore }, ref) => {
    return (
      <div ref={ref} className="flex-1 overflow-y-auto space-y-1">
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {isLoadingMore && (
          <div className="text-center text-muted-foreground py-4 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            <span>Loading older messages...</span>
          </div>
        )}

        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";
