import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../db/dexie';

export default function ActivityList() {
  const activities = useLiveQuery(() => db.activities.toArray(), []) ?? [];
  return <div><div className='mb-3 flex justify-between'><h1 className='text-xl'>Activities</h1><Link className='rounded bg-blue-600 px-3 py-2' to='/activities/new'>New Activity</Link></div><div className='space-y-2'>{activities.filter((a) => !a.deletedAt).map((a) => <Link to={`/activities/${a.id}`} key={a.id} className='block rounded border border-slate-800 p-3'><div className='font-semibold'>{a.title}</div><div className='text-xs text-slate-400'>{a.status} · P{a.priority} · {a.tags.join(', ')}</div></Link>)}</div></div>;
}
