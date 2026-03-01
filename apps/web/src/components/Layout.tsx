import { Link, Outlet } from 'react-router-dom';
import { SyncIndicator } from './SyncIndicator';
import { OfflineBadge } from './OfflineBadge';
import { useAuthStore } from '../stores/auth.store';

export function Layout() {
  const { user, logout } = useAuthStore();
  return <div className='min-h-screen bg-slate-950 text-slate-100'><header className='flex items-center justify-between border-b border-slate-800 p-3'><div className='flex items-center gap-3'><Link to='/activities' className='font-bold'>CarloTracko</Link><SyncIndicator /><OfflineBadge /></div><div className='flex items-center gap-3 text-sm'>{user?.role === 'admin' && <Link to='/admin/users'>Admin</Link>}<button onClick={logout}>Logout</button></div></header><main className='mx-auto max-w-3xl p-4'><Outlet /></main></div>;
}
