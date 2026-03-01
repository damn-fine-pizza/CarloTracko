import { z } from 'zod';
import {
  activityDeletePayloadSchema,
  activitySchema,
  activityUpsertPayloadSchema,
  loginRequestSchema,
  loginResponseSchema,
  mutationSchema,
  noteDeletePayloadSchema,
  noteSchema,
  noteUpsertPayloadSchema,
  syncPullResponseSchema,
  syncPushRequestSchema,
  syncPushResponseSchema,
  tagsSetPayloadSchema,
  userSchema,
} from './schemas';

export type User = z.infer<typeof userSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type Note = z.infer<typeof noteSchema>;
export type Mutation = z.infer<typeof mutationSchema>;
export type ActivityUpsertPayload = z.infer<typeof activityUpsertPayloadSchema>;
export type ActivityDeletePayload = z.infer<typeof activityDeletePayloadSchema>;
export type NoteUpsertPayload = z.infer<typeof noteUpsertPayloadSchema>;
export type NoteDeletePayload = z.infer<typeof noteDeletePayloadSchema>;
export type TagsSetPayload = z.infer<typeof tagsSetPayloadSchema>;
export type SyncPushRequest = z.infer<typeof syncPushRequestSchema>;
export type SyncPushResponse = z.infer<typeof syncPushResponseSchema>;
export type SyncPullResponse = z.infer<typeof syncPullResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
