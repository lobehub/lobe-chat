import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LocalDB } from '../db';
import { dbSchemaV3 } from '../schemas';
import { LOBE_CHAT_LOCAL_DB_NAME } from '../types/db';

beforeEach(async () => {
  // 确保在测试开始前删除数据库
  await Dexie.delete(LOBE_CHAT_LOCAL_DB_NAME);
});

afterEach(async () => {
  // 确保在测试结束后删除数据库
  await Dexie.delete(LOBE_CHAT_LOCAL_DB_NAME);
});

describe('LocalDB migration', () => {
  it('should upgrade from version 3 to version 4 correctly', async () => {
    // 使用版本3的schema创建数据库实例并填充测试数据
    const dbV3 = new Dexie(LOBE_CHAT_LOCAL_DB_NAME);
    dbV3.version(3).stores(dbSchemaV3);
    await dbV3.open();
    await dbV3.table('sessions').bulkAdd([
      { id: 's1', group: 'pinned' },
      { id: 's2', group: 'default' },
    ]);
    dbV3.close();

    // 创建新的数据库实例，包含版本4的迁移逻辑
    const dbV4 = new LocalDB();
    await dbV4.open();

    // 验证迁移后的数据
    const updatedSession1 = await dbV4.sessions.get('s1');
    const updatedSession2 = await dbV4.sessions.get('s2');
    expect(updatedSession1).toEqual({ id: 's1', pinned: 1, group: 'default' });
    expect(updatedSession2).toEqual({ id: 's2', pinned: 0, group: 'default' });

    dbV4.close();
  });
});
