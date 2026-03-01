import rateLimit from '@fastify/rate-limit';
import type { FastifyPluginAsync } from 'fastify';

export const rateLimitPlugin: FastifyPluginAsync = async (app) => {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
};
