import { knex } from 'knex';
// If knexfile.js is CommonJS, use `require` instead of `import`
const config = require('./knexfile');

(async () => {
  const db = knex(config.production);

  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('Migrations completed!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await db.destroy();
  }
})();