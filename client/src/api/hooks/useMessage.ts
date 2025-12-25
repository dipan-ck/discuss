import api from "@/lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

interface Message {
  messages: any[];
  nextCursor: string | null;
}

export const useInfiniteMessages = (channelId?: string) => {
  return useInfiniteQuery<Message>({
    queryKey: ["messages", channelId],
    initialPageParam: "",

    queryFn: async ({ pageParam }) => {
      if (!channelId) return { messages: [], nextCursor: null };

      const res = await api.get(
        `/message/${channelId}/messages`,
        {
          params: {
            limit: 30,
            cursor: pageParam ?? ""   // empty means first page
          }
        }
      );

      // backend response shape:
      // { data: { messages: [...], nextCursor }, message: "..." }
      return res.data.data;
    },

    // tell React Query what cursor to use for next page
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined;
    },

    enabled: !!channelId,
    refetchOnWindowFocus: false,
  });
};
