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

// Global object for instance management
interface LobeGlobal {
  pgDB?: LobeChatDatabase;
  pgDBInitPromise?: Promise<LobeChatDatabase>;
  pgDBLock?: {
    acquired: boolean;
    lockPath: string;
  };
}

// Ensure globalThis has our namespace
declare global {
  // eslint-disable-next-line no-var
  var __LOBE__: LobeGlobal;
}

if (!globalThis.__LOBE__) {
  globalThis.__LOBE__ = {};
}

/**
 * Attempt to create a file lock to ensure singleton pattern
 * Returns true if lock acquired successfully, false if another instance is already running
 */
const acquireLock = async (dbPath: string): Promise<boolean> => {
  try {
    // Database lock file path
    const lockPath = `${dbPath}.lock`;

    // Attempt to create lock file
    if (!fs.existsSync(lockPath)) {
      // Create lock file and write current process ID
      fs.writeFileSync(lockPath, process.pid.toString(), 'utf8');

      // Save lock information to global object
      if (!globalThis.__LOBE__.pgDBLock) {
        globalThis.__LOBE__.pgDBLock = {
          acquired: true,
          lockPath,
        };
      }

      console.log(`✅ Successfully acquired database lock: ${lockPath}`);
      return true;
    }

    // Check if lock file has expired (not updated for over 5 minutes)
    const stats = fs.statSync(lockPath);
    const currentTime = Date.now();
    const modifiedTime = stats.mtime.getTime();

    // If lock file hasn't been updated for over 5 minutes, consider it expired
    if (currentTime - modifiedTime > 5 * 60 * 1000) {
      // Delete expired lock file
      fs.unlinkSync(lockPath);
      // Recreate lock file
      fs.writeFileSync(lockPath, process.pid.toString(), 'utf8');

      // Save lock information to global object
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
 * Release file lock
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

// Release lock on process exit
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

    // If hash is the same, check if all tables exist
    if (hash === cacheHash) {
      try {
        const drizzleMigration = new DrizzleMigrationModel(db);

        // Check if tables exist in the database
        const tableCount = await drizzleMigration.getTableCounts();

        // If table count is greater than 0, assume database is properly initialized
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
      // Execute migration
      // @ts-expect-error
      await db.dialect.migrate(migrations, db.session, {});

      await electronIpcClient.setDatabaseSchemaHash(hash);

      console.info(`✅ Electron DB migration success, took ${Date.now() - start}ms`);
    } catch (error) {
      console.error('❌ Electron database schema migration failed', error);

      // Attempt to query migration table data
      let migrationsTableData: MigrationTableItem[] = [];
      try {
        // Attempt to query migration table
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
 * Check if there's an active database instance and attempt to close it if exists
 */
const checkAndCleanupExistingInstance = async () => {
  if (globalThis.__LOBE__.pgDB) {
    try {
      // Attempt to close existing PGlite instance (if client has close method)
      // @ts-expect-error
      const client = globalThis.__LOBE__.pgDB?.dialect?.client;

      if (client && typeof client.close === 'function') {
        await client.close();
        console.log('✅ Successfully closed previous PGlite instance');
      }

      // Reset global reference
      globalThis.__LOBE__.pgDB = undefined;
    } catch (error) {
      console.error('❌ Failed to close previous PGlite instance:', error);
      // Continue execution and create new instance
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

    // Already initialized, return instance directly
    if (globalThis.__LOBE__.pgDB) return globalThis.__LOBE__.pgDB;

    // Initialization promise in progress, wait for it to complete
    if (globalThis.__LOBE__.pgDBInitPromise) {
      console.log('Waiting for existing initialization promise to complete');
      return globalThis.__LOBE__.pgDBInitPromise;
    }

    // Prevent race conditions from multiple calls
    if (isInitializing) {
      console.log('Already initializing, waiting for result');
      // Create new Promise to wait for initialization to complete
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

    // Create and save initialization Promise
    globalThis.__LOBE__.pgDBInitPromise = (async () => {
      // Check again in case another call succeeded during wait
      if (globalThis.__LOBE__.pgDB) return globalThis.__LOBE__.pgDB;

      // Get database path first
      let dbPath: string = '';
      try {
        dbPath = await electronIpcClient.getDatabasePath();
      } catch {
        /* empty */
      }

      console.log('Database path:', dbPath);
      try {
        // Attempt to acquire database lock
        const lockAcquired = await acquireLock(dbPath);
        if (!lockAcquired) {
          throw new Error('Cannot acquire database lock. Another instance might be using it.');
        }

        // Check and cleanup any existing old instances
        await checkAndCleanupExistingInstance();

        // Create new PGlite instance
        console.log('Creating new PGlite instance');
        const client = new PGlite(dbPath, {
          extensions: { vector },
          // Add options to improve stability
          relaxedDurability: true,
        });

        // Wait for database to be ready
        await client.waitReady;
        console.log('PGlite state:', client.ready);

        // Create Drizzle database instance
        const db = pgliteDrizzle({ client, schema }) as unknown as LobeChatDatabase;

        // Execute migration
        await migrateDatabase(db);

        // Save instance reference
        globalThis.__LOBE__.pgDB = db;

        console.log('✅ PGlite instance successfully initialized');

        return db;
      } catch (error) {
        console.error('❌ Failed to initialize PGlite instance:', error);
        // Clear initialization Promise to allow retry next time
        globalThis.__LOBE__.pgDBInitPromise = undefined;
        // Release potentially acquired lock
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
