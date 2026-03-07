import { create } from 'zustand';
import api from '../lib/api';

interface User {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { data } = await api.get('/auth/me');
      set({ user: data, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't auto logout on every error, maybe network issue. 
      // But if 401, interceptor should handle or we handle here.
      // For now, if we can't verify, we might keep local state or reset.
      // set({ token: null, user: null, isAuthenticated: false });
      // localStorage.removeItem('token');
    }
  }
}));
