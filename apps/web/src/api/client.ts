import { useAuthStore } from '../stores/auth.store';
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function apiFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const { accessToken, refreshToken, setTokens, logout } = useAuthStore.getState();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (res.status === 401 && retry && refreshToken) {
    const refreshRes = await fetch(`${API}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
    if (!refreshRes.ok) { logout(); return res; }
    const refreshed = await refreshRes.json() as { accessToken: string; refreshToken: string };
    setTokens(refreshed.accessToken, refreshed.refreshToken);
    return apiFetch(path, init, false);
  }
  return res;
}
