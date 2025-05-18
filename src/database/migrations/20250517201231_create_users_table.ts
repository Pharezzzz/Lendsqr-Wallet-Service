import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("users", (table) => {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.string('name').notNullable();
        table.decimal('balance', 14, 2).notNullable().defaultTo(0.0);
        table.timestamps(true, true);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("users");
}

