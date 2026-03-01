import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';

export default function NoteList({ activityId }: { activityId: string }) {
  const notes = useLiveQuery(() => db.notes.where('activityId').equals(activityId).toArray(), [activityId]) ?? [];
  return <div className='space-y-2'>{notes.filter((n) => !n.deletedAt).map((n) => <div key={n.id} className='rounded border border-slate-800 p-2 whitespace-pre-wrap'>{n.body}</div>)}</div>;
}
