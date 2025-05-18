import knex from 'knex';
import knexConfig from '../knexfile.js';

// Determine environment (default to 'development')
const environment = process.env.NODE_ENV || 'development';

// Create a Knex instance using the config for the current environment
const db = knex(knexConfig[environment]);

export default db;
