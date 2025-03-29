import { PGlite } from '@electric-sql/pglite';
import { drizzle as pgliteDrizzle } from 'drizzle-orm/pglite';

import * as schema from '@/database/schemas';
import { electronIpcClient } from '@/server/modules/ElectronIPCClient';

import { LobeChatDatabase } from '../type';

export const getPgliteInstance = async () => {
  const dbPath = await electronIpcClient.getDatabasePath();

  const client = new PGlite(dbPath);

  return pgliteDrizzle({ client, schema }) as unknown as LobeChatDatabase;
};
