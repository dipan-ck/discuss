// store/auth.store.ts
import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  profileColor?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  setProfileColor: (color: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  setProfileColor: (color) => set((state) => ({
    user: state.user ? { ...state.user, profileColor: color } : null
  })),
}));
