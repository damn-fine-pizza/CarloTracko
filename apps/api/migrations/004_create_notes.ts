import type { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notes', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.uuid('activity_id').notNullable().references('id').inTable('activities').onDelete('CASCADE');
    table.text('body').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.bigInteger('version').notNullable().defaultTo(1);
  });
  await knex.schema.raw('CREATE INDEX notes_activity_updated_idx ON notes(activity_id, updated_at)');
  await knex.schema.raw('CREATE INDEX notes_activity_created_idx ON notes(activity_id, created_at)');
}
export async function down(knex: Knex): Promise<void> { await knex.schema.dropTableIfExists('notes'); }
