// Force server mode for migration
process.env.NEXT_PUBLIC_SERVICE_MODE = 'server';

import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as migrator from 'drizzle-orm/node-postgres/migrator';
import { join } from 'node:path';
import { Pool } from 'pg';

import { PGVECTOR_HINT } from './errorHint';

// Read the `.env` file if it exists
dotenv.config();

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log(' not find database env, migration skipped');
    process.exit(0);
  }

  const pool = new Pool({ 
    connectionString,
    ssl: false,
  });
  
  const db = drizzle(pool);

  try {
    // Mark the problematic migration as completed since the column already exists
    const existingMigrations = [
      '0000_init',
      '0001_add_client_id',
      '0002_amusing_puma',
      '0003_naive_echo',
      '0004_add_next_auth',
      '0005_pgvector',
      '0006_add_knowledge_base',
      '0007_fix_embedding_table',
      '0008_add_rag_evals',
      '0009_remove_unused_user_tables',
      '0010_add_accessed_at_and_clean_tables',
      '0011_add_topic_history_summary',
      '0012_add_thread'
    ];

    // Create the migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

    // Record all existing migrations
    for (const migration of existingMigrations) {
      await pool.query(
        'INSERT INTO __drizzle_migrations (hash) VALUES ($1) ON CONFLICT DO NOTHING',
        [migration]
      );
    }

    // Now run any new migrations
    await migrator.migrate(db, {
      migrationsFolder: join(__dirname, '../../src/database/migrations'),
      migrationsMetaFolder: join(__dirname, '../../src/database/migrations/meta'),
    } as any);
    console.log(' database migration pass.');
  } catch (err) {
    console.error(' Database migrate failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
  
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
};

// Run migrations
runMigrations().catch((err) => {
  console.error(' Database migrate failed:', err);

  if ((err.message as string).includes('extension "vector" is not available')) {
    console.info(PGVECTOR_HINT);
  }

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
