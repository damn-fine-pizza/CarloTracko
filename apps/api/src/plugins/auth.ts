import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyRequest {
    auth: { userId: string; role: 'admin' | 'user' };
  }

  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}

export const authPlugin = fp(async (app) => {
  await app.register(jwt, { secret: config.JWT_SECRET });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify<{ userId: string; role: 'admin' | 'user' }>();
      request.auth = { userId: decoded.userId, role: decoded.role };
    } catch {
      reply.status(401).send({ message: 'Unauthorized' });
    }
  });

  app.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    await app.authenticate(request, reply);
    if (reply.sent) return;
    if (request.auth.role !== 'admin') {
      reply.status(403).send({ message: 'Forbidden' });
    }
  });
});
