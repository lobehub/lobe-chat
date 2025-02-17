import { getServerDB } from './db-adaptor';

/**
 * 初始化数据库
 * 在应用启动时调用此函数，确保数据库在首次请求到达前已初始化
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing database during application startup...');
    await getServerDB();
    console.log('✅ Database initialized successfully during startup');
  } catch (error) {
    console.error('❌ Failed to initialize database during startup:', error);
    // 不抛出错误，允许应用继续启动
    // 后续请求会再次尝试初始化数据库
  }
};
