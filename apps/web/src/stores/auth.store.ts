import { create } from 'zustand';
import { apiFetch } from '../api/client';

type User = { id: string; username: string; role: 'admin' | 'user' };

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
  setTokens: (a: string, r: string) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const stored = localStorage.getItem('refreshToken');

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: stored,
  user: null,
  loading: false,
  setTokens: (a, r) => { localStorage.setItem('refreshToken', r); set({ accessToken: a, refreshToken: r }); },
  login: async (username, password) => {
    set({ loading: true });
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json() as { accessToken: string; refreshToken: string; user: User };
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user, loading: false });
  },
  logout: () => { localStorage.removeItem('refreshToken'); set({ accessToken: null, refreshToken: null, user: null }); apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: stored }) }).catch(() => undefined); },
}));
