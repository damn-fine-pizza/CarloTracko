import { db } from '../db/connection';
import { hashPassword } from './auth.service';

export async function listUsers() {
  const users = await db('users').select('id', 'username', 'role', 'is_active as isActive', 'force_password_change as forcePasswordChange');
  return users;
}

export async function createUser(input: { username: string; password: string; role: 'admin' | 'user' }) {
  const passwordHash = await hashPassword(input.password);
  const [user] = await db('users')
    .insert({ username: input.username, password_hash: passwordHash, role: input.role })
    .returning(['id', 'username', 'role', 'is_active as isActive', 'force_password_change as forcePasswordChange']);
  return user;
}

export async function updateUser(id: string, input: { isActive?: boolean; password?: string; role?: 'admin' | 'user' }) {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof input.isActive === 'boolean') patch.is_active = input.isActive;
  if (input.role) patch.role = input.role;
  if (input.password) {
    patch.password_hash = await hashPassword(input.password);
    patch.force_password_change = false;
  }
  const [user] = await db('users').where({ id }).update(patch).returning(['id', 'username', 'role', 'is_active as isActive', 'force_password_change as forcePasswordChange']);
  return user;
}
