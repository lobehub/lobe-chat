import { isServerMode } from '@/const/version';
import { getDBInstance } from '@/database/core/web-server';
import { LobeChatDatabase } from '@/database/type';

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
    cachedDB = getDBInstance();
    return cachedDB;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// 为了向后兼容，保留 serverDB 导出
// 但使用代理对象延迟初始化，确保只在真正访问属性时才初始化
export const serverDB = new Proxy({} as LobeChatDatabase, {
  get: (target, prop) => {
    if (isServerMode) return getDBInstance();

    // 确保数据库已初始化
    if (!cachedDB) {
      throw new Error(
        'Database not initialized. Please call getServerDB() before accessing serverDB properties.',
      );
    }
    return cachedDB[prop as keyof LobeChatDatabase];
  },
});
