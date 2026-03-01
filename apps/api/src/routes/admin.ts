import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { createUser, listUsers, updateUser } from '../services/user.service';

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/admin/users', { preHandler: app.requireAdmin }, async () => ({ users: await listUsers() }));

  app.post('/admin/users', { preHandler: app.requireAdmin }, async (request, reply) => {
    const body = z.object({ username: z.string().min(1), password: z.string().min(8), role: z.enum(['admin', 'user']).default('user') }).parse(request.body);
    const user = await createUser(body);
    reply.status(201).send({ user });
  });

  app.patch('/admin/users/:id', { preHandler: app.requireAdmin }, async (request) => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({ isActive: z.boolean().optional(), password: z.string().min(8).optional(), role: z.enum(['admin', 'user']).optional() }).parse(request.body);
    const user = await updateUser(params.id, body);
    return { user };
  });
};
