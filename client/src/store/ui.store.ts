import { deleteServer } from '@/services/server.service';
import {create} from 'zustand';

interface UiStore {
  selectedServer: any | null;
  selectedChannel: any | null;
  setSelectedServer: (server: any | null) => void;
  setSelectedChannel: (channel: any | null) => void;
  isSearchServerModalOpen?: boolean;
  setIsSearchServerModalOpen?: (isOpen: boolean) => void;

  isCreateChannelModalOpen?: boolean;
  setIsCreateChannelModalOpen?: (isOpen: boolean) => void;


  deleteServerModalOpen?: boolean;
  setDeleteServerModalOpen?: (isOpen: boolean) => void;

  leaveServerModalOpen?: boolean;
  setLeaveServerModalOpen?: (isOpen: boolean) => void;

  userProfileModalOpen?: boolean;
  setUserProfileModalOpen?: (isOpen: boolean) => void;

}



export const useUiStore = create<UiStore>((set) => ({
  selectedServer: null,
  selectedChannel: null,
  isSearchServerModalOpen: false,
  isCreateChannelModalOpen: false,
  deleteServerModalOpen: false,
  leaveServerModalOpen: false,


  setSelectedServer: (server) => set(() => ({
    selectedServer: server,
    selectedChannel: server?.channels?.[0] ?? null
  })),

  setSelectedChannel: (channel) =>
    set({ selectedChannel: channel }),

  setIsSearchServerModalOpen: (isOpen) =>
    set({ isSearchServerModalOpen: isOpen }),

  setIsCreateChannelModalOpen: (isOpen) =>
    set({ isCreateChannelModalOpen: isOpen }),

  setDeleteServerModalOpen: (isOpen) =>
    set({ deleteServerModalOpen: isOpen }),

  setLeaveServerModalOpen: (isOpen) =>
    set({ leaveServerModalOpen: isOpen }),

  setUserProfileModalOpen: (isOpen) =>
    set({ userProfileModalOpen: isOpen })

}))