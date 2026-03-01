import { store } from '../db/repository';
import { flushOutbox } from './outbox';
import { mergeRemote } from './merger';
import { apiFetch } from '../api/client';
import { useUiStore } from '../stores/ui.store';
import type { LocalActivity, LocalNote } from '../db/dexie';

let syncing = false;
let timer: number | null = null;

export async function ensureSyncState() {
  const existing = await store.getSyncState();
  if (!existing) {
    await store.setSyncState({ key: 'main', clientId: crypto.randomUUID(), cursor: null, lastSyncAt: null });
  }
}

export async function runSync() {
  if (syncing || !navigator.onLine) { useUiStore.getState().setSyncStatus('offline'); return; }
  syncing = true;
  useUiStore.getState().setSyncStatus('syncing');
  try {
    await ensureSyncState();
    const state = await store.getSyncState();
    if (!state) return;
    const pushed = await flushOutbox(state.clientId);
    const pullRes = await apiFetch(`/sync/pull?clientId=${state.clientId}${state.cursor ? `&cursor=${encodeURIComponent(state.cursor)}` : ''}`);
    if (pullRes.ok) {
      const data = await pullRes.json() as { activities: LocalActivity[]; notes: LocalNote[]; tags: Array<{ activityId: string; tag: string }>; newCursor: string };
      await mergeRemote(data.activities, data.notes, data.tags);
      await store.setSyncState({ ...state, cursor: data.newCursor, lastSyncAt: new Date().toISOString() });
      console.debug(`Sync completed: pushed ${pushed} mutations, pulled ${data.activities.length + data.notes.length} changes`);
    }
    useUiStore.getState().setSyncStatus('synced');
    useUiStore.getState().setLastSyncAt(new Date().toISOString());
  } finally {
    syncing = false;
  }
}

export function scheduleSync(ms = 2000) {
  if (timer) clearTimeout(timer);
  timer = window.setTimeout(() => { void runSync(); }, ms);
}

export function setupSyncTriggers() {
  window.addEventListener('online', () => void runSync());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void runSync(); });
  window.setInterval(() => { if (navigator.onLine) void runSync(); }, 60000);
}
