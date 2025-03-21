import { clientDB, initializeDB } from '@/database/client/db';
import { getTestDBInstance } from '@/database/server/core/dbForTest';
import { LobeChatDatabase } from '@/database/type';

export const isServerDBMode = process.env.TEST_SERVER_DB === '1';

export const getTestDB = async () => {
  if (isServerDBMode) return await getTestDBInstance();

  await initializeDB();
  return clientDB as LobeChatDatabase;
};
