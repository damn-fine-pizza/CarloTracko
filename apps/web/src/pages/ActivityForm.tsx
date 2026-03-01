import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/dexie';
import { store } from '../db/repository';
import { uuid } from '../utils/uuid';
import { scheduleSync } from '../sync/engine';
import { useAuthStore } from '../stores/auth.store';

export default function ActivityForm() {
  const [title, setTitle] = useState('');
  const nav = useNavigate();
  const userId = useAuthStore((s) => s.user?.id ?? '');
  return <form onSubmit={async (e) => { e.preventDefault(); const now = new Date().toISOString(); const id = uuid(); await db.activities.put({ id, userId, title, priority: 0, status: 'inbox', dueAt: null, tags: [], createdAt: now, updatedAt: now, deletedAt: null, version: 1 }); await store.enqueue({ mutationId: uuid(), type: 'activity_upsert', payload: { id, title, priority: 0, status: 'inbox', dueAt: null }, baseVersion: 0, createdAt: now, tries: 0, lastError: null }); scheduleSync(); nav(`/activities/${id}`); }} className='space-y-3'><input value={title} onChange={(e) => setTitle(e.target.value)} className='w-full rounded bg-slate-900 p-2' placeholder='Title' /><button className='rounded bg-blue-600 px-3 py-2'>Save</button></form>;
}
