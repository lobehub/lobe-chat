import { Pool as NeonPool } from '@neondatabase/serverless';
import { NeonDatabase, drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';

import { serverDBEnv } from '@/config/db';
import { isServerMode } from '@/const/version';

import * as schema from '../schemas';

/**
 * @description db instance for edge runtime
 * @returns db instance
 */
export const getDBInstance = (): NeonDatabase<typeof schema> => {
  if (!isServerMode) return {} as any;

  if (!serverDBEnv.KEY_VAULTS_SECRET) {
    throw new Error(
      ` \`KEY_VAULTS_SECRET\` is not set, please set it in your environment variables.

If you don't have it, please run \`openssl rand -base64 32\` to create one.
`,
    );
  }

  let connectionString = serverDBEnv.DATABASE_URL;

  if (!connectionString) {
    throw new Error(`You are try to use database, but "DATABASE_URL" is not set correctly`);
  }

  const client = new NeonPool({ connectionString });
  return neonDrizzle(client, { schema });
};

export const serverDB = getDBInstance();
