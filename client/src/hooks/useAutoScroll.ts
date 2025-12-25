import { useEffect, useCallback } from "react";

const SCROLL_THRESHOLD = 200;
const INITIAL_MESSAGE_LIMIT = 30;

interface UseAutoScrollProps {
  containerRef: React.RefObject<HTMLDivElement>;
  messages: any[];
  isLoading: boolean;
}

export function useAutoScroll({
  containerRef,
  messages,
  isLoading,
}: UseAutoScrollProps) {
  const isNearBottom = useCallback(() => {
    const div = containerRef.current;
    if (!div) return false;
    return (
      div.scrollHeight - div.scrollTop - div.clientHeight < SCROLL_THRESHOLD
    );
  }, [containerRef]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const div = containerRef.current;
      if (!div) return;

      div.scrollTo({
        top: div.scrollHeight,
        behavior,
      });
    },
    [containerRef]
  );

  // Auto-scroll to bottom on initial load or when near bottom
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const behavior =
        messages.length <= INITIAL_MESSAGE_LIMIT ? "instant" : "smooth";

      if (isNearBottom() || messages.length <= INITIAL_MESSAGE_LIMIT) {
        scrollToBottom(behavior as ScrollBehavior);
      }
    }
  }, [messages.length, isLoading, isNearBottom, scrollToBottom]);

  return { isNearBottom, scrollToBottom };
}
