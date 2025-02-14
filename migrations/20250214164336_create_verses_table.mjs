import getMigrators from "knex-migrate-sql-file";
export const { up, down } = getMigrators();
