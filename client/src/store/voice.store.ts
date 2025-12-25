import { create } from "zustand";

interface VoiceState {
  users: Record<string, any[]>;
  isJoined: Record<string, boolean>;

  setUsers: (channelId: string, users: any[]) => void;
  clearChannel: (channelId: string) => void;
  setJoined: (channelId: string, joined: boolean) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  users: {},
  isJoined: {},

  setUsers: (channelId, newUsers) =>
    set((state) => ({
      users: {
        ...state.users,
        [channelId]: newUsers,
      },
    })),

  clearChannel: (channelId) =>
    set((state) => {
      const { [channelId]: _, ...rest } = state.users;
      const { [channelId]: __, ...restJoined } = state.isJoined;
      return { users: rest, isJoined: restJoined };
    }),

  setJoined: (channelId, joined) =>
    set((state) => ({
      isJoined: {
        ...state.isJoined,
        [channelId]: joined,
      },
    })),
}));
