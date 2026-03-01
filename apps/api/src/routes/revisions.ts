import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/connection';

export const revisionsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/activities/:id/revisions', { preHandler: app.authenticate }, async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const revisions = await db('activity_revisions').where({ user_id: request.auth.userId, activity_id: id }).orderBy('created_at', 'desc');
    return { revisions };
  });

  app.get('/notes/:id/revisions', { preHandler: app.authenticate }, async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const revisions = await db('note_revisions').where({ user_id: request.auth.userId, note_id: id }).orderBy('created_at', 'desc');
    return { revisions };
  });
};
