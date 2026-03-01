import argon2 from 'argon2';
import crypto from 'node:crypto';
import { db } from '../db/connection';

const hashRefresh = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export async function createSession(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
  await db('sessions').insert({ user_id: userId, refresh_token_hash: hashRefresh(refreshToken), expires_at: expiresAt.toISOString() });
}

export async function rotateRefreshToken(refreshToken: string): Promise<{ userId: string } | null> {
  const tokenHash = hashRefresh(refreshToken);
  const session = await db('sessions').where({ refresh_token_hash: tokenHash }).whereNull('revoked_at').first();
  if (!session) return null;
  if (new Date(session.expires_at).getTime() <= Date.now()) return null;
  await db('sessions').where({ id: session.id }).update({ revoked_at: new Date().toISOString() });
  return { userId: session.user_id as string };
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await db('sessions').where({ refresh_token_hash: hashRefresh(refreshToken) }).update({ revoked_at: new Date().toISOString() });
}
