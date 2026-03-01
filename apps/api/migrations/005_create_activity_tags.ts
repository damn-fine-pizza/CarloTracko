import type { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('activity_tags', (table) => {
    table.uuid('user_id').notNullable();
    table.uuid('activity_id').notNullable().references('id').inTable('activities').onDelete('CASCADE');
    table.text('tag').notNullable();
    table.primary(['user_id', 'activity_id', 'tag']);
  });
  await knex.schema.raw('CREATE INDEX activity_tags_user_tag_idx ON activity_tags(user_id, tag)');
}
export async function down(knex: Knex): Promise<void> { await knex.schema.dropTableIfExists('activity_tags'); }
