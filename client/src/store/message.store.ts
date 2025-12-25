import { create } from "zustand";
import api from "@/lib/axios";




export const useMessageStore = create((set, get) => ({
  messagesByChannel: {},
  cursorByChannel: {},
  isLoadingByChannel: {},
  errorByChannel: {},

  fetchMessages: async (channelId: string, limit = 30) => {
    const { cursorByChannel } = get();

    const cursor = cursorByChannel[channelId] ?? "";

    // mark loading
    set((state) => ({
      isLoadingByChannel: {
        ...state.isLoadingByChannel,
        [channelId]: true,
      },
    }));

    try {
      const res = await api.get(`/message/${channelId}/messages`, {
        params: { limit, cursor },
      });

      const { messages, nextCursor } = res.data.data;

      // backend gives newest → oldest
      // frontend UI needs oldest → newest
      const fixedMessages = [...messages].reverse();

      set((state) => ({
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: [
            ...fixedMessages,
            ...(state.messagesByChannel[channelId] ?? []),
          ],
        },
        cursorByChannel: {
          ...state.cursorByChannel,
          [channelId]: nextCursor,
        },
        isLoadingByChannel: {
          ...state.isLoadingByChannel,
          [channelId]: false,
        },
      }));
    } catch (err) {
      set((state) => ({
        errorByChannel: {
          ...state.errorByChannel,
          [channelId]: "Failed to load messages",
        },
        isLoadingByChannel: {
          ...state.isLoadingByChannel,
          [channelId]: false,
        },
      }));
    }
  },

  appendMessage: (channelId, message) =>
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: [
          ...(state.messagesByChannel[channelId] ?? []),
          message,
        ],
      },
    })),

    

  clearChannelMessages: (channelId) =>
    set((state) => ({
      messagesByChannel: { ...state.messagesByChannel, [channelId]: [] },
      cursorByChannel: { ...state.cursorByChannel, [channelId]: null },
    })),
}));
