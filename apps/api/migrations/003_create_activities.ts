import type { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('activities', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.text('title').notNullable();
    table.specificType('priority', 'smallint').notNullable().defaultTo(0);
    table.text('status').notNullable().defaultTo('inbox');
    table.timestamp('due_at', { useTz: true }).nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.bigInteger('version').notNullable().defaultTo(1);
    table.check('priority between 0 and 3');
    table.check("status in ('inbox','active','done','archived')");
  });
  await knex.schema.raw('CREATE INDEX activities_user_updated_idx ON activities(user_id, updated_at)');
  await knex.schema.raw('CREATE INDEX activities_user_status_idx ON activities(user_id, status)');
}
export async function down(knex: Knex): Promise<void> { await knex.schema.dropTableIfExists('activities'); }
