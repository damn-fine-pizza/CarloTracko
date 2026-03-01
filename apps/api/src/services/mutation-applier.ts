import type { Knex } from 'knex';
import type { Mutation } from '@carlotracko/shared';
import { activityUpsertPayloadSchema, activityDeletePayloadSchema, noteUpsertPayloadSchema, noteDeletePayloadSchema, tagsSetPayloadSchema } from '@carlotracko/shared';

export async function applyMutation(trx: Knex.Transaction, userId: string, clientId: string, mutation: Mutation) {
  const existing = await trx('mutations').where({ user_id: userId, client_id: clientId, mutation_id: mutation.mutationId }).first();
  if (existing) {
    return { mutationId: mutation.mutationId, status: 'already_applied' as const };
  }

  let conflict = false;
  let serverVersion: number | undefined;

  if (mutation.type === 'activity_upsert') {
    const payload = activityUpsertPayloadSchema.parse(mutation.payload);
    const current = await trx('activities').where({ id: payload.id, user_id: userId }).first();
    if (current) {
      conflict = mutation.baseVersion !== Number(current.version);
      await trx('activity_revisions').insert({ user_id: userId, activity_id: payload.id, version: current.version, op: 'upsert', snapshot: JSON.stringify(current), mutation_id: mutation.mutationId, client_id: clientId });
      const [updated] = await trx('activities').where({ id: payload.id, user_id: userId }).update({
        title: payload.title, priority: payload.priority, status: payload.status, due_at: payload.dueAt, updated_at: trx.fn.now(), deleted_at: null, version: trx.raw('version + 1')
      }).returning(['version']);
      serverVersion = Number(updated.version);
    } else {
      const [created] = await trx('activities').insert({
        id: payload.id, user_id: userId, title: payload.title, priority: payload.priority, status: payload.status, due_at: payload.dueAt, version: 1
      }).returning(['version']);
      serverVersion = Number(created.version);
    }
  }

  if (mutation.type === 'activity_delete') {
    const payload = activityDeletePayloadSchema.parse(mutation.payload);
    const current = await trx('activities').where({ id: payload.id, user_id: userId }).first();
    if (current) {
      conflict = mutation.baseVersion !== Number(current.version);
      await trx('activity_revisions').insert({ user_id: userId, activity_id: payload.id, version: current.version, op: 'delete', snapshot: JSON.stringify(current), mutation_id: mutation.mutationId, client_id: clientId });
      const [deleted] = await trx('activities').where({ id: payload.id, user_id: userId }).update({ deleted_at: trx.fn.now(), updated_at: trx.fn.now(), version: trx.raw('version + 1') }).returning(['version']);
      serverVersion = Number(deleted.version);
    }
  }

  if (mutation.type === 'note_upsert') {
    const payload = noteUpsertPayloadSchema.parse(mutation.payload);
    const current = await trx('notes').where({ id: payload.id, user_id: userId }).first();
    if (current) {
      conflict = mutation.baseVersion !== Number(current.version);
      await trx('note_revisions').insert({ user_id: userId, note_id: payload.id, activity_id: current.activity_id, version: current.version, op: 'upsert', snapshot: JSON.stringify(current), mutation_id: mutation.mutationId, client_id: clientId });
      const [updated] = await trx('notes').where({ id: payload.id, user_id: userId }).update({ body: payload.body, updated_at: trx.fn.now(), deleted_at: null, version: trx.raw('version + 1') }).returning(['version']);
      serverVersion = Number(updated.version);
    } else {
      const [created] = await trx('notes').insert({ id: payload.id, user_id: userId, activity_id: payload.activityId, body: payload.body, version: 1 }).returning(['version']);
      serverVersion = Number(created.version);
    }
  }

  if (mutation.type === 'note_delete') {
    const payload = noteDeletePayloadSchema.parse(mutation.payload);
    const current = await trx('notes').where({ id: payload.id, user_id: userId }).first();
    if (current) {
      conflict = mutation.baseVersion !== Number(current.version);
      await trx('note_revisions').insert({ user_id: userId, note_id: payload.id, activity_id: current.activity_id, version: current.version, op: 'delete', snapshot: JSON.stringify(current), mutation_id: mutation.mutationId, client_id: clientId });
      const [deleted] = await trx('notes').where({ id: payload.id, user_id: userId }).update({ deleted_at: trx.fn.now(), updated_at: trx.fn.now(), version: trx.raw('version + 1') }).returning(['version']);
      serverVersion = Number(deleted.version);
    }
  }

  if (mutation.type === 'tags_set') {
    const payload = tagsSetPayloadSchema.parse(mutation.payload);
    await trx('activity_tags').where({ user_id: userId, activity_id: payload.activityId }).del();
    if (payload.tags.length > 0) {
      await trx('activity_tags').insert(payload.tags.map((tag) => ({ user_id: userId, activity_id: payload.activityId, tag })));
    }
  }

  await trx('mutations').insert({ user_id: userId, client_id: clientId, mutation_id: mutation.mutationId });
  return { mutationId: mutation.mutationId, status: 'applied' as const, conflict, serverVersion };
}
