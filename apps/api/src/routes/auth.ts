import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/connection';
import { createSession, generateRefreshToken, revokeRefreshToken, rotateRefreshToken, verifyPassword } from '../services/auth.service';
import { loginRequestSchema } from '@carlotracko/shared';

const passwordPolicy = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/auth/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const input = loginRequestSchema.parse(request.body);
    const user = await db('users').where({ username: input.username }).first();
    if (!user || !(await verifyPassword(input.password, user.password_hash))) {
      return reply.status(401).send({ message: 'Invalid credentials' });
    }
    if (!user.is_active) return reply.status(403).send({ message: 'User inactive' });

    const accessToken = app.jwt.sign({ userId: user.id, role: user.role }, { expiresIn: '15m' });
    const refreshToken = generateRefreshToken();
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createSession(user.id, refreshToken, expiry);

    return { accessToken, refreshToken, user: { id: user.id, username: user.username, role: user.role, isActive: user.is_active, forcePasswordChange: user.force_password_change } };
  });

  app.post('/auth/refresh', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const body = z.object({ refreshToken: z.string() }).parse(request.body);
    const rotated = await rotateRefreshToken(body.refreshToken);
    if (!rotated) return reply.status(401).send({ message: 'Invalid refresh token' });

    const user = await db('users').where({ id: rotated.userId }).first();
    if (!user) return reply.status(401).send({ message: 'Invalid session user' });

    const accessToken = app.jwt.sign({ userId: user.id, role: user.role }, { expiresIn: '15m' });
    const refreshToken = generateRefreshToken();
    await createSession(user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    return { accessToken, refreshToken };
  });

  app.post('/auth/logout', { preHandler: app.authenticate }, async (request, reply) => {
    const body = z.object({ refreshToken: z.string() }).parse(request.body);
    await revokeRefreshToken(body.refreshToken);
    reply.status(204).send();
  });

  app.get('/auth/me', { preHandler: app.authenticate }, async (request) => {
    const user = await db('users').where({ id: request.auth.userId }).first();
    return { user: { id: user.id, username: user.username, role: user.role, isActive: user.is_active, forcePasswordChange: user.force_password_change } };
  });

  app.post('/auth/password-policy-check', async (request) => {
    const body = z.object({ password: z.string() }).parse(request.body);
    return { valid: passwordPolicy.test(body.password) };
  });
};
