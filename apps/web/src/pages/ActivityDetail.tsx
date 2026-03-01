import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useParams } from 'react-router-dom';
import { db } from '../db/dexie';
import { store } from '../db/repository';
import { uuid } from '../utils/uuid';
import { scheduleSync } from '../sync/engine';
import { useState } from 'react';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';

export default function ActivityDetail() {
  const { id = '' } = useParams();
  const activity = useLiveQuery(() => db.activities.get(id), [id]);
  const [title, setTitle] = useState('');
  if (!activity) return <div>Not found</div>;
  return <div className='space-y-3'><input className='w-full rounded bg-slate-900 p-2 text-xl' value={title || activity.title} onChange={(e) => setTitle(e.target.value)} onBlur={async () => { const now = new Date().toISOString(); const next = { ...activity, title: title || activity.title, updatedAt: now, version: activity.version + 1 }; await db.activities.put(next); await store.enqueue({ mutationId: uuid(), type: 'activity_upsert', payload: { id: activity.id, title: next.title, priority: next.priority, status: next.status, dueAt: next.dueAt }, baseVersion: activity.version, createdAt: now, tries: 0, lastError: null }); scheduleSync(); }} /><Link to={`/activities/${activity.id}/history`} className='text-sm underline'>History</Link><NoteList activityId={activity.id} /><NoteEditor activityId={activity.id} /></div>;
}
