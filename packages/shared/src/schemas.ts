import { z } from 'zod';
import { MUTATION_TYPES, PRIORITY_RANGE, STATUS_VALUES } from './constants';

export const uuidSchema = z.string().uuid();

export const userSchema = z.object({
  id: uuidSchema,
  username: z.string().min(1),
  role: z.enum(['admin', 'user']),
  isActive: z.boolean().optional(),
  forcePasswordChange: z.boolean().optional(),
});

export const activitySchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  title: z.string().min(1),
  priority: z.number().int().min(PRIORITY_RANGE.min).max(PRIORITY_RANGE.max),
  status: z.enum(STATUS_VALUES),
  dueAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  version: z.number().int().positive(),
});

export const noteSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  activityId: uuidSchema,
  body: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  version: z.number().int().positive(),
});

export const activityUpsertPayloadSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1),
  priority: z.number().int().min(0).max(3),
  status: z.enum(STATUS_VALUES),
  dueAt: z.string().datetime().nullable(),
});

export const activityDeletePayloadSchema = z.object({ id: uuidSchema });

export const noteUpsertPayloadSchema = z.object({
  id: uuidSchema,
  activityId: uuidSchema,
  body: z.string(),
});

export const noteDeletePayloadSchema = z.object({ id: uuidSchema });

export const tagsSetPayloadSchema = z.object({
  activityId: uuidSchema,
  tags: z.array(z.string().min(1)).max(50),
});

export const mutationSchema = z.object({
  mutationId: uuidSchema,
  type: z.enum(MUTATION_TYPES),
  payload: z.record(z.unknown()),
  baseVersion: z.number().int().nonnegative(),
});

export const syncPushRequestSchema = z.object({
  clientId: uuidSchema,
  mutations: z.array(mutationSchema).max(50),
});

export const syncPushResponseSchema = z.object({
  results: z.array(
    z.object({
      mutationId: uuidSchema,
      status: z.enum(['applied', 'already_applied']),
      conflict: z.boolean().optional(),
      serverVersion: z.number().int().optional(),
    }),
  ),
});

export const syncPullResponseSchema = z.object({
  activities: z.array(activitySchema),
  notes: z.array(noteSchema),
  tags: z.array(z.object({ activityId: uuidSchema, tag: z.string() })),
  newCursor: z.string().datetime(),
});

export const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});
