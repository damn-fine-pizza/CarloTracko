import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { syncPushRequestSchema } from '@carlotracko/shared';
import { pullChanges, pushMutations } from '../services/sync.service';

export const syncRoutes: FastifyPluginAsync = async (app) => {
  app.post('/sync/push', { preHandler: app.authenticate }, async (request) => {
    const body = syncPushRequestSchema.parse(request.body);
    const results = await pushMutations(request.auth.userId, body.clientId, body.mutations);
    return { results };
  });

  app.get('/sync/pull', { preHandler: app.authenticate }, async (request) => {
    const q = z.object({ cursor: z.string().datetime().nullable().optional(), clientId: z.string().uuid() }).parse(request.query);
    return pullChanges(request.auth.userId, q.clientId, q.cursor ?? null);
  });
};
