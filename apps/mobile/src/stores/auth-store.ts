import { create } from 'zustand';
import storage from '../utils/storage';
import type { UserProfile } from '@lightroutine/types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await storage.setItemAsync('accessToken', accessToken);
    await storage.setItemAsync('refreshToken', refreshToken);
    await storage.setItemAsync('user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  clearAuth: async () => {
    await storage.deleteItemAsync('accessToken');
    await storage.deleteItemAsync('refreshToken');
    await storage.deleteItemAsync('user');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadAuth: async () => {
    try {
      const token = await storage.getItemAsync('accessToken');
      const userStr = await storage.getItemAsync('user');
      if (token && userStr) {
        const user = JSON.parse(userStr) as UserProfile;
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
