import Dexie, { type Table } from 'dexie';

export interface LocalActivity {
  id: string;
  userId: string;
  title: string;
  priority: number;
  status: 'inbox' | 'active' | 'done' | 'archived';
  dueAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

export interface LocalNote {
  id: string;
  userId: string;
  activityId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

export interface OutboxMutation {
  id?: number;
  mutationId: string;
  type: 'activity_upsert' | 'activity_delete' | 'note_upsert' | 'note_delete' | 'tags_set';
  payload: Record<string, unknown>;
  baseVersion: number;
  createdAt: string;
  tries: number;
  lastError: string | null;
}

export interface SyncState {
  key: 'main';
  clientId: string;
  cursor: string | null;
  lastSyncAt: string | null;
}

class CarloTrackoDB extends Dexie {
  activities!: Table<LocalActivity, string>;
  notes!: Table<LocalNote, string>;
  outbox!: Table<OutboxMutation, number>;
  syncState!: Table<SyncState, string>;

  constructor() {
    super('carlotracko');
    this.version(1).stores({
      activities: 'id, status, updatedAt, *tags',
      notes: 'id, activityId, updatedAt',
      outbox: '++id, createdAt',
      syncState: 'key',
    });
  }
}

export const db = new CarloTrackoDB();
