export const STATUS_VALUES = ['inbox', 'active', 'done', 'archived'] as const;
export const PRIORITY_RANGE = { min: 0, max: 3 } as const;
export const MUTATION_TYPES = [
  'activity_upsert',
  'activity_delete',
  'note_upsert',
  'note_delete',
  'tags_set',
] as const;
