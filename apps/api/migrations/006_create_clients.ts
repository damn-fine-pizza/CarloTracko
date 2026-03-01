import type { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('clients', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.text('device_name').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('last_seen_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('sync_cursor', { useTz: true }).nullable();
  });
  await knex.schema.raw('CREATE INDEX clients_user_idx ON clients(user_id)');
}
export async function down(knex: Knex): Promise<void> { await knex.schema.dropTableIfExists('clients'); }
