import { store } from '../db/repository';
import { apiFetch } from '../api/client';

export async function flushOutbox(clientId: string): Promise<number> {
  const batch = await store.peekOutbox(50);
  if (!batch.length) return 0;
  const res = await apiFetch('/sync/push', { method: 'POST', body: JSON.stringify({ clientId, mutations: batch.map(({ mutationId, type, payload, baseVersion }) => ({ mutationId, type, payload, baseVersion })) }) });
  if (!res.ok) throw new Error('Push failed');
  const data = await res.json() as { results: Array<{ mutationId: string; status: 'applied' | 'already_applied' }> };
  const ids = batch.filter((b) => data.results.some((r) => r.mutationId === b.mutationId)).map((x) => x.id).filter((v): v is number => typeof v === 'number');
  await store.removeFromOutbox(ids);
  return ids.length;
}
