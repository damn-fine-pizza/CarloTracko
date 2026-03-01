import type { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('activity_revisions', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('user_id').notNullable();
    table.uuid('activity_id').notNullable();
    table.bigInteger('version').notNullable();
    table.text('op').notNullable();
    table.jsonb('snapshot').notNullable();
    table.uuid('mutation_id').nullable();
    table.uuid('client_id').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.check("op in ('upsert','delete')");
  });
  await knex.schema.raw('CREATE INDEX activity_revisions_lookup ON activity_revisions(user_id, activity_id, created_at DESC)');

  await knex.schema.createTable('note_revisions', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('user_id').notNullable();
    table.uuid('note_id').notNullable();
    table.uuid('activity_id').notNullable();
    table.bigInteger('version').notNullable();
    table.text('op').notNullable();
    table.jsonb('snapshot').notNullable();
    table.uuid('mutation_id').nullable();
    table.uuid('client_id').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.check("op in ('upsert','delete')");
  });
  await knex.schema.raw('CREATE INDEX note_revisions_lookup ON note_revisions(user_id, note_id, created_at DESC)');
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('note_revisions');
  await knex.schema.dropTableIfExists('activity_revisions');
}
