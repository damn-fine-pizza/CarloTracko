import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';

export default function RevisionTimeline() {
  const { id = '' } = useParams();
  const [revisions, setRevisions] = useState<Array<{ id: number; op: string; snapshot: unknown; created_at: string }>>([]);
  useEffect(() => { void (async () => { const res = await apiFetch(`/activities/${id}/revisions`); if (res.ok) { const data = await res.json() as { revisions: Array<{ id: number; op: string; snapshot: unknown; created_at: string }> }; setRevisions(data.revisions); } })(); }, [id]);
  return <div className='space-y-2'>{revisions.map((r) => <div key={r.id} className='rounded border border-slate-800 p-2 text-sm'><div>{r.op} · {new Date(r.created_at).toLocaleString()}</div><pre className='overflow-auto text-xs'>{JSON.stringify(r.snapshot, null, 2)}</pre></div>)}</div>;
}
