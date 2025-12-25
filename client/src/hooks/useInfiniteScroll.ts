import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "@/store/message.store";

const SCROLL_TOP_THRESHOLD = 100;
const PAGINATION_LIMIT = 30;

interface UseInfiniteScrollProps {
  channelId: string | undefined;
  containerRef: React.RefObject<HTMLDivElement>;
  hasNextPage: boolean;
}

export function useInfiniteScroll({
  channelId,
  containerRef,
  hasNextPage,
}: UseInfiniteScrollProps) {
  const { fetchMessages } = useMessageStore();
  const isFetchingMore = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const div = containerRef.current;
    if (!div || !channelId || !hasNextPage) return;

    const onScroll = async () => {
      if (
        div.scrollTop < SCROLL_TOP_THRESHOLD &&
        !isFetchingMore.current &&
        !isLoadingMore
      ) {
        isFetchingMore.current = true;
        setIsLoadingMore(true);

        const prevHeight = div.scrollHeight;
        const prevScrollTop = div.scrollTop;

        try {
          await fetchMessages(channelId, PAGINATION_LIMIT);

          // Restore scroll position after new messages load
          requestAnimationFrame(() => {
            if (div) {
              const newHeight = div.scrollHeight;
              div.scrollTop = prevScrollTop + (newHeight - prevHeight);
            }
          });
        } catch (error) {
          console.error("Failed to fetch more messages:", error);
        } finally {
          isFetchingMore.current = false;
          setIsLoadingMore(false);
        }
      }
    };

    div.addEventListener("scroll", onScroll);
    return () => div.removeEventListener("scroll", onScroll);
  }, [channelId, hasNextPage, isLoadingMore, fetchMessages, containerRef]);

  return { isLoadingMore };
}
