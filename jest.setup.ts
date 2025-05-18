import knex from 'knex';
import knexConfig from './knexfile';

const environment = 'test';
const db = knex(knexConfig[environment]);

beforeAll(async () => {
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});