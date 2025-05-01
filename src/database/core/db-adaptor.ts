import { isDesktop } from '@/const/version';
import { getDBInstance } from '@/database/core/web-server';
import { LobeChatDatabase } from '@/database/type';

import { getPgliteInstance } from './electron';

/**
 * 懒加载数据库实例
 * 避免每次模块导入时都初始化数据库
 */
let cachedDB: LobeChatDatabase | null = null;

export const getServerDB = async (): Promise<LobeChatDatabase> => {
  // 如果已经有缓存的实例，直接返回
  if (cachedDB) return cachedDB;

  try {
    // 根据环境选择合适的数据库实例
    cachedDB = isDesktop ? await getPgliteInstance() : getDBInstance();
    return cachedDB;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export const serverDB = getDBInstance();
