import { db } from '../db/connection';

export async function exportJson(userId: string) {
  const activities = await db('activities').where({ user_id: userId }).whereNull('deleted_at');
  const notes = await db('notes').where({ user_id: userId }).whereNull('deleted_at');
  return { activities, notes };
}

export async function exportMarkdown(userId: string) {
  const { activities, notes } = await exportJson(userId);
  const grouped = new Map<string, Array<{ body: string }>>();
  notes.forEach((note) => {
    const arr = grouped.get(note.activity_id) ?? [];
    arr.push({ body: note.body });
    grouped.set(note.activity_id, arr);
  });

  const lines: string[] = ['# CarloTracko Export'];
  activities.forEach((a) => {
    lines.push(`\n## ${a.title}`);
    lines.push(`- Status: ${a.status}`);
    lines.push(`- Priority: ${a.priority}`);
    const activityNotes = grouped.get(a.id) ?? [];
    activityNotes.forEach((n, i) => {
      lines.push(`\n### Note ${i + 1}`);
      lines.push(n.body);
    });
  });
  return lines.join('\n');
}
