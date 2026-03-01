import type { Knex } from 'knex';
import argon2 from 'argon2';

export async function up(knex: Knex): Promise<void> {
  const existing = await knex('users').where({ username: 'admin' }).first();
  if (existing) return;
  const passwordHash = await argon2.hash('changeme', { type: argon2.argon2id });
  await knex('users').insert({
    username: 'admin',
    password_hash: passwordHash,
    role: 'admin',
    force_password_change: true,
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex('users').where({ username: 'admin' }).del();
}
