import { useState } from 'react';
import { db } from '../db/dexie';
import { store } from '../db/repository';
import { uuid } from '../utils/uuid';
import { scheduleSync } from '../sync/engine';
import { useAuthStore } from '../stores/auth.store';

export default function NoteEditor({ activityId }: { activityId: string }) {
  const [body, setBody] = useState('');
  const userId = useAuthStore((s) => s.user?.id ?? '');
  return <form className='space-y-2' onSubmit={async (e) => { e.preventDefault(); const now = new Date().toISOString(); const id = uuid(); await db.notes.put({ id, activityId, userId, body, createdAt: now, updatedAt: now, deletedAt: null, version: 1 }); await store.enqueue({ mutationId: uuid(), type: 'note_upsert', payload: { id, activityId, body }, baseVersion: 0, createdAt: now, tries: 0, lastError: null }); setBody(''); scheduleSync(); }}><textarea className='w-full rounded bg-slate-900 p-2' value={body} onChange={(e) => setBody(e.target.value)} /><button className='rounded bg-blue-600 px-3 py-2'>Add Note</button></form>;
}
