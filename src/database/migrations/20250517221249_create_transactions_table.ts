import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('transactions', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.decimal('amount', 14, 2).notNullable();
        table.enum('type', ['credit', 'debit']).notNullable();
        table.string('description').notNullable();
        table.timestamps(true, true); // created_at and updated_at
      });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('transactions');
}

