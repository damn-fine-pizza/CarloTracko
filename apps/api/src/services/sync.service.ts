import { db } from '../db/connection';
import type { Mutation } from '@carlotracko/shared';
import { applyMutation } from './mutation-applier';

export async function pushMutations(userId: string, clientId: string, mutations: Mutation[]) {
  const results = [] as Array<{ mutationId: string; status: 'applied' | 'already_applied'; conflict?: boolean; serverVersion?: number }>;
  for (const mutation of mutations) {
    const result = await db.transaction((trx) => applyMutation(trx, userId, clientId, mutation));
    results.push(result);
  }
  return results;
}

export async function pullChanges(userId: string, clientId: string, cursor: string | null) {
  const now = new Date().toISOString();
  const client = await db('clients').where({ id: clientId }).first();
  if (client) {
    await db('clients').where({ id: clientId }).update({ last_seen_at: now, sync_cursor: cursor });
  } else {
    await db('clients').insert({ id: clientId, user_id: userId, last_seen_at: now, sync_cursor: cursor });
  }

  const baseCursor = cursor ?? new Date(0).toISOString();
  const activities = await db('activities').where({ user_id: userId }).andWhere('updated_at', '>', baseCursor);
  const notes = await db('notes').where({ user_id: userId }).andWhere('updated_at', '>', baseCursor);
  const activityIds = activities.map((a) => a.id);
  const tags = activityIds.length > 0 ? await db('activity_tags').where({ user_id: userId }).whereIn('activity_id', activityIds).select('activity_id as activityId', 'tag') : [];

  return {
    activities: activities.map((a) => ({
      id: a.id,
      userId: a.user_id,
      title: a.title,
      priority: a.priority,
      status: a.status,
      dueAt: a.due_at ? new Date(a.due_at).toISOString() : null,
      createdAt: new Date(a.created_at).toISOString(),
      updatedAt: new Date(a.updated_at).toISOString(),
      deletedAt: a.deleted_at ? new Date(a.deleted_at).toISOString() : null,
      version: Number(a.version),
    })),
    notes: notes.map((n) => ({
      id: n.id,
      userId: n.user_id,
      activityId: n.activity_id,
      body: n.body,
      createdAt: new Date(n.created_at).toISOString(),
      updatedAt: new Date(n.updated_at).toISOString(),
      deletedAt: n.deleted_at ? new Date(n.deleted_at).toISOString() : null,
      version: Number(n.version),
    })),
    tags,
    newCursor: now,
  };
}
