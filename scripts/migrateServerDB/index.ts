import * as dotenv from 'dotenv';
import * as migrator from 'drizzle-orm/neon-serverless/migrator';
import { join } from 'node:path';

import { serverDB } from '../../src/database/server/core/db';
import { PGVECTOR_HINT } from './errorHint';

// Read the `.env` file if it exists, or a file specified by the
// dotenv_config_path parameter that's passed to Node.js
dotenv.config();

const runMigrations = async () => {
  await migrator.migrate(serverDB, {
    migrationsFolder: join(__dirname, '../../src/database/migrations'),
  });
  console.log('✅ database migration pass.');
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
};

let connectionString = process.env.DATABASE_URL;

// only migrate database if the connection string is available
if (connectionString) {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  runMigrations().catch((err) => {
    console.error('❌ Database migrate failed:', err);

    if ((err.message as string).includes('extension "vector" is not available')) {
      console.info(PGVECTOR_HINT);
    }

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  });
} else {
  console.log('🟢 not find database env, migration skipped');
}
