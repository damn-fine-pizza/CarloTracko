import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState<Array<{ id: string; username: string; role: string; isActive: boolean }>>([]);
  useEffect(() => { void (async () => { const res = await apiFetch('/admin/users'); if (res.ok) { const data = await res.json() as { users: Array<{ id: string; username: string; role: string; isActive: boolean }> }; setUsers(data.users); } })(); }, []);
  return <div><h1 className='mb-3 text-xl'>Users</h1>{users.map((u) => <div key={u.id}>{u.username} ({u.role}) {u.isActive ? 'active' : 'disabled'}</div>)}</div>;
}
