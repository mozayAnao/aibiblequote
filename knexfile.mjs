// Update with your config settings.
import dotenv from "dotenv";

dotenv.config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "bible_db",
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "migrations",
    },
    seeds: {
      directory: "seeds",
    },
  }
};
