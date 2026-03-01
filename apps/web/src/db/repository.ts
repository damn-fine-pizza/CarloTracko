import { db, type LocalActivity, type LocalNote, type OutboxMutation, type SyncState } from './dexie';

export interface ActivityFilters { status?: LocalActivity['status']; query?: string; priority?: number; }

export interface IDataStore {
  getActivities(filters?: ActivityFilters): Promise<LocalActivity[]>;
  getActivity(id: string): Promise<LocalActivity | undefined>;
  upsertActivity(activity: LocalActivity): Promise<void>;
  getNotesByActivity(activityId: string): Promise<LocalNote[]>;
  getNote(id: string): Promise<LocalNote | undefined>;
  upsertNote(note: LocalNote): Promise<void>;
  enqueue(mutation: Omit<OutboxMutation, 'id'>): Promise<void>;
  peekOutbox(limit: number): Promise<OutboxMutation[]>;
  removeFromOutbox(ids: number[]): Promise<void>;
  hasOutboxForEntity(entityId: string): Promise<boolean>;
  getSyncState(): Promise<SyncState | undefined>;
  setSyncState(state: SyncState): Promise<void>;
}

export class DexieStore implements IDataStore {
  async getActivities(filters?: ActivityFilters): Promise<LocalActivity[]> {
    const all = await db.activities.toArray();
    return all.filter((a) => !a.deletedAt)
      .filter((a) => (filters?.status ? a.status === filters.status : true))
      .filter((a) => (filters?.priority !== undefined ? a.priority === filters.priority : true))
      .filter((a) => (filters?.query ? `${a.title} ${a.tags.join(' ')}`.toLowerCase().includes(filters.query.toLowerCase()) : true));
  }
  getActivity(id: string) { return db.activities.get(id); }
  upsertActivity(activity: LocalActivity) { return db.activities.put(activity).then(() => undefined); }
  getNotesByActivity(activityId: string) { return db.notes.where('activityId').equals(activityId).toArray(); }
  getNote(id: string) { return db.notes.get(id); }
  upsertNote(note: LocalNote) { return db.notes.put(note).then(() => undefined); }
  enqueue(mutation: Omit<OutboxMutation, 'id'>) { return db.outbox.add(mutation).then(() => undefined); }
  peekOutbox(limit: number) { return db.outbox.orderBy('createdAt').limit(limit).toArray(); }
  removeFromOutbox(ids: number[]) { return db.outbox.bulkDelete(ids); }
  async hasOutboxForEntity(entityId: string) {
    const rows = await db.outbox.toArray();
    return rows.some((m) => {
      const payloadId = typeof m.payload.id === 'string' ? m.payload.id : undefined;
      const activityId = typeof m.payload.activityId === 'string' ? m.payload.activityId : undefined;
      return payloadId === entityId || activityId === entityId;
    });
  }
  getSyncState() { return db.syncState.get('main'); }
  setSyncState(state: SyncState) { return db.syncState.put(state).then(() => undefined); }
}

export const store = new DexieStore();
