import type { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('mutations', (table) => {
    table.uuid('user_id').notNullable();
    table.uuid('client_id').notNullable();
    table.uuid('mutation_id').notNullable();
    table.timestamp('applied_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.primary(['user_id', 'client_id', 'mutation_id']);
  });
}
export async function down(knex: Knex): Promise<void> { await knex.schema.dropTableIfExists('mutations'); }
