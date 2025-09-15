import { clientDB, initializeDB } from '../../client/db';
import { LobeChatDatabase } from '../../type';

const isServerDBMode = process.env.TEST_SERVER_DB === '1';

export const getTestDB = async () => {
  if (isServerDBMode) {
    const { getTestDBInstance } = await import('../../core/dbForTest');
    return await getTestDBInstance();
  }

  await initializeDB();
  return clientDB as LobeChatDatabase;
};
