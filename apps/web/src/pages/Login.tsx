import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { runSync } from '../sync/engine';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('changeme');
  const { login, loading } = useAuthStore();
  const nav = useNavigate();
  return <form className='mx-auto mt-20 max-w-sm space-y-3' onSubmit={async (e) => { e.preventDefault(); await login(username, password); await runSync(); nav('/activities'); }}><input className='w-full rounded bg-slate-900 p-2' value={username} onChange={(e) => setUsername(e.target.value)} /><input className='w-full rounded bg-slate-900 p-2' type='password' value={password} onChange={(e) => setPassword(e.target.value)} /><button disabled={loading} className='w-full rounded bg-blue-600 p-2'>{loading ? 'Signing in...' : 'Login'}</button></form>;
}
