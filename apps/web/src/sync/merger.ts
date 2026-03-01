import { db, type LocalActivity, type LocalNote } from '../db/dexie';
import { store } from '../db/repository';

export async function mergeRemote(activities: LocalActivity[], notes: LocalNote[], tags: Array<{ activityId: string; tag: string }>) {
  await db.transaction('rw', db.activities, db.notes, async () => {
    for (const activity of activities) {
      if (!(await store.hasOutboxForEntity(activity.id))) {
        const activityTags = tags.filter((t) => t.activityId === activity.id).map((t) => t.tag);
        await db.activities.put({ ...activity, tags: activityTags });
      }
    }
    for (const note of notes) {
      if (!(await store.hasOutboxForEntity(note.id))) {
        await db.notes.put(note);
      }
    }
  });
}
