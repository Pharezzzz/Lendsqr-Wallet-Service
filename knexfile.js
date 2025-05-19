// Update with your config settings.
const path = require('path');
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
require('dotenv').config();
module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  },

  test: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './src/database/migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
      tableName: 'knex_migrations',
      extension: 'ts'
    }
  }

};
