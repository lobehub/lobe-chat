import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import * as migrator from 'drizzle-orm/neon-serverless/migrator';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import * as nodeMigrator from 'drizzle-orm/node-postgres/migrator';
import { join } from 'node:path';
import { Pool as NodePool } from 'pg';
import ws from 'ws';

import { serverDBEnv } from '@/config/db';

import * as schema from '../schemas';

const migrationsFolder = join(__dirname, '../migrations');

export const getTestDBInstance = async () => {
  let connectionString = serverDBEnv.DATABASE_TEST_URL;

  if (!connectionString) {
    throw new Error(`You are try to use database, but "DATABASE_TEST_URL" is not set correctly`);
  }

  if (serverDBEnv.DATABASE_DRIVER === 'node') {
    const client = new NodePool({ connectionString });

    const db = nodeDrizzle(client, { schema });

    await nodeMigrator.migrate(db, { migrationsFolder });

    return db;
  }

  // https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined
  neonConfig.webSocketConstructor = ws;

  const client = new NeonPool({ connectionString });

  const db = neonDrizzle(client, { schema });

  await migrator.migrate(db, { migrationsFolder });

  return db;
};
