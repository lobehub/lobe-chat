import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { join } from 'path';

import { PGVECTOR_HINT } from './errorHint';

// Read the `.env` file if it exists, or a file specified by the
// dotenv_config_path parameter that's passed to Node.js
dotenv.config();

// 配置数据库连接
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const runMigrations = async () => {
  try {
    // 连接数据库
    await client.connect();
    
    // 创建 drizzle 实例
    const db = drizzle(client);
    
    // 执行迁移
    await migrate(db, {
      migrationsFolder: join(__dirname, '../../src/database/server/migrations'),
    });
    
    console.log('✅ Database migration pass.');
  } catch (err: unknown) {
    console.error('❌ Database migrate failed:', err);
    
    if (typeof err === 'object' && err && 'message' in err) {
      if ((err.message as string).includes('extension "vector" is not available')) {
        console.info(PGVECTOR_HINT);
      }
    }
    
    throw err;
  } finally {
    // 关闭连接
    await client.end();
  }
};

// 检查数据库连接串
if (process.env.DATABASE_URL) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  console.log('🟢 Not find database env, migration skipped');
  process.exit(0);
}
