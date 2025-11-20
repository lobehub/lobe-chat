import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite/vector';
import type { MigrationTableItem } from '@lobechat/types';
import { drizzle as pgliteDrizzle } from 'drizzle-orm/pglite';
import fs from 'node:fs';
import { Md5 } from 'ts-md5';

import { electronIpcClient } from '@/server/modules/ElectronIPCClient';

import { DrizzleMigrationModel } from '../models/drizzleMigration';
import * as schema from '../schemas';
import { LobeChatDatabase } from '../type';
import migrations from './migrations.json';

// 用于实例管理的全局对象
interface LobeGlobal {
  pgDB?: LobeChatDatabase;
  pgDBInitPromise?: Promise<LobeChatDatabase>;
  pgDBLock?: {
    acquired: boolean;
    lockPath: string;
  };
}

// 确保 globalThis 有我们的命名空间
declare global {
  // eslint-disable-next-line no-var
  var __LOBE__: LobeGlobal;
}

if (!globalThis.__LOBE__) {
  globalThis.__LOBE__ = {};
}

/**
 * 尝试创建一个文件锁来确保单例模式
 * 返回 true 表示成功获取锁，false 表示已有其他实例正在运行
 */
const acquireLock = async (dbPath: string): Promise<boolean> => {
  try {
    // 数据库锁文件路径
    const lockPath = `${dbPath}.lock`;

    // 尝试创建锁文件
    if (!fs.existsSync(lockPath)) {
      // 创建锁文件并写入当前进程 ID
      fs.writeFileSync(lockPath, process.pid.toString(), 'utf8');

      // 保存锁信息到全局对象
      if (!globalThis.__LOBE__.pgDBLock) {
        globalThis.__LOBE__.pgDBLock = {
          acquired: true,
          lockPath,
        };
      }

      console.log(`✅ Successfully acquired database lock: ${lockPath}`);
      return true;
    }

    // 检查锁文件是否过期（超过5分钟未更新）
    const stats = fs.statSync(lockPath);
    const currentTime = Date.now();
    const modifiedTime = stats.mtime.getTime();

    // 如果锁文件超过5分钟未更新，视为过期锁
    if (currentTime - modifiedTime > 5 * 60 * 1000) {
      // 删除过期锁文件
      fs.unlinkSync(lockPath);
      // 重新创建锁文件
      fs.writeFileSync(lockPath, process.pid.toString(), 'utf8');

      // 保存锁信息到全局对象
      if (!globalThis.__LOBE__.pgDBLock) {
        globalThis.__LOBE__.pgDBLock = {
          acquired: true,
          lockPath,
        };
      }

      console.log(`✅ Removed stale lock and acquired new lock: ${lockPath}`);
      return true;
    }

    console.warn(`⚠️ Another process has already locked the database: ${lockPath}`);
    return false;
  } catch (error) {
    console.error('❌ Failed to acquire database lock:', error);
    return false;
  }
};

/**
 * 释放文件锁
 */
const releaseLock = () => {
  if (globalThis.__LOBE__.pgDBLock?.acquired && globalThis.__LOBE__.pgDBLock.lockPath) {
    try {
      fs.unlinkSync(globalThis.__LOBE__.pgDBLock.lockPath);
      globalThis.__LOBE__.pgDBLock.acquired = false;
      console.log(`✅ Released database lock: ${globalThis.__LOBE__.pgDBLock.lockPath}`);
    } catch (error) {
      console.error('❌ Failed to release database lock:', error);
    }
  }
};

// 在进程退出时释放锁
process.on('exit', releaseLock);
process.on('SIGINT', () => {
  releaseLock();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  // ignore ECONNRESET error
  if ((error as any).code === 'ECONNRESET') return;

  console.error('Uncaught exception:', error);
  releaseLock();
});

const migrateDatabase = async (db: LobeChatDatabase): Promise<void> => {
  try {
    let hash: string | undefined;
    const cacheHash = await electronIpcClient.getDatabaseSchemaHash();

    hash = Md5.hashStr(JSON.stringify(migrations));

    console.log('schemaHash:', hash);

    // 如果哈希值相同，看下表是否全了
    if (hash === cacheHash) {
      try {
        const drizzleMigration = new DrizzleMigrationModel(db);

        // 检查数据库中是否存在表
        const tableCount = await drizzleMigration.getTableCounts();

        // 如果表数量大于0，则认为数据库已正确初始化
        if (tableCount > 0) {
          console.log('✅ Electron DB schema already synced');
          return;
        }
      } catch (error) {
        console.warn('Error checking table existence, proceeding with migration:');
        console.warn(error);
      }
    }

    const start = Date.now();
    console.log('🚀 Starting Electron DB migration...');

    try {
      // 执行迁移
      // @ts-expect-error
      await db.dialect.migrate(migrations, db.session, {});

      await electronIpcClient.setDatabaseSchemaHash(hash);

      console.info(`✅ Electron DB migration success, took ${Date.now() - start}ms`);
    } catch (error) {
      console.error('❌ Electron database schema migration failed', error);

      // 尝试查询迁移表数据
      let migrationsTableData: MigrationTableItem[] = [];
      try {
        // 尝试查询迁移表
        const drizzleMigration = new DrizzleMigrationModel(db);
        migrationsTableData = await drizzleMigration.getMigrationList();
      } catch (queryError) {
        console.error('Failed to query migrations table:', queryError);
      }

      throw {
        error: error as Error,
        migrationTableItems: migrationsTableData,
      };
    }
  } catch (error) {
    console.error('❌ Electron database migration failed:', error);
    throw error;
  }
};

/**
 * 检查当前是否有活跃的数据库实例，如果有则尝试关闭它
 */
const checkAndCleanupExistingInstance = async () => {
  if (globalThis.__LOBE__.pgDB) {
    try {
      // 尝试关闭现有的 PGlite 实例 (如果客户端有 close 方法)
      // @ts-expect-error
      const client = globalThis.__LOBE__.pgDB?.dialect?.client;

      if (client && typeof client.close === 'function') {
        await client.close();
        console.log('✅ Successfully closed previous PGlite instance');
      }

      // 重置全局引用
      globalThis.__LOBE__.pgDB = undefined;
    } catch (error) {
      console.error('❌ Failed to close previous PGlite instance:', error);
      // 继续执行，创建新实例
    }
  }
};

let isInitializing = false;

export const getPgliteInstance = async (): Promise<LobeChatDatabase> => {
  try {
    console.log(
      'Getting PGlite instance, state:',
      JSON.stringify({
        hasExistingDB: !!globalThis.__LOBE__.pgDB,
        hasPromise: !!globalThis.__LOBE__.pgDBInitPromise,
        isInitializing,
      }),
    );

    // 已经初始化完成，直接返回实例
    if (globalThis.__LOBE__.pgDB) return globalThis.__LOBE__.pgDB;

    // 有初始化进行中的Promise，等待它完成
    if (globalThis.__LOBE__.pgDBInitPromise) {
      console.log('Waiting for existing initialization promise to complete');
      return globalThis.__LOBE__.pgDBInitPromise;
    }

    // 防止多次调用引起的竞态条件
    if (isInitializing) {
      console.log('Already initializing, waiting for result');
      // 创建新的 Promise 等待初始化完成
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (globalThis.__LOBE__.pgDB) {
            clearInterval(checkInterval);
            resolve(globalThis.__LOBE__.pgDB);
          } else if (!isInitializing) {
            clearInterval(checkInterval);
            reject(new Error('Initialization failed or was canceled'));
          }
        }, 100);
      });
    }

    isInitializing = true;

    // 创建初始化Promise并保存
    globalThis.__LOBE__.pgDBInitPromise = (async () => {
      // 再次检查，以防在等待过程中已有其他调用初始化成功
      if (globalThis.__LOBE__.pgDB) return globalThis.__LOBE__.pgDB;

      // 先获取数据库路径
      let dbPath: string = '';
      try {
        dbPath = await electronIpcClient.getDatabasePath();
      } catch {
        /* empty */
      }

      console.log('Database path:', dbPath);
      try {
        // 尝试获取数据库锁
        const lockAcquired = await acquireLock(dbPath);
        if (!lockAcquired) {
          throw new Error('Cannot acquire database lock. Another instance might be using it.');
        }

        // 检查并清理可能存在的旧实例
        await checkAndCleanupExistingInstance();

        // 创建新的 PGlite 实例
        console.log('Creating new PGlite instance');
        const client = new PGlite(dbPath, {
          extensions: { vector },
          // 增加选项以提高稳定性
          relaxedDurability: true,
        });

        // 等待数据库就绪
        await client.waitReady;
        console.log('PGlite state:', client.ready);

        // 创建 Drizzle 数据库实例
        const db = pgliteDrizzle({ client, schema }) as unknown as LobeChatDatabase;

        // 执行迁移
        await migrateDatabase(db);

        // 保存实例引用
        globalThis.__LOBE__.pgDB = db;

        console.log('✅ PGlite instance successfully initialized');

        return db;
      } catch (error) {
        console.error('❌ Failed to initialize PGlite instance:', error);
        // 清空初始化Promise，允许下次重试
        globalThis.__LOBE__.pgDBInitPromise = undefined;
        // 释放可能已获取的锁
        releaseLock();
        throw error;
      } finally {
        isInitializing = false;
      }
    })();

    return globalThis.__LOBE__.pgDBInitPromise;
  } catch (error) {
    console.error('❌ Unexpected error in getPgliteInstance:', error);
    isInitializing = false;
    throw error;
  }
};
