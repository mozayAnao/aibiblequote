
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.createTable("verses", table => {
        table.increments();
        table.string("book", 50).notNullable();
        table.string("chapter").notNullable();
        table.string("verse").notNullable();
        table.string("text").notNullable();
        table.string("version").notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.dropTable("verses");
};
