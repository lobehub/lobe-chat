import { readMigrationFiles } from 'drizzle-orm/migrator';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dbBase = join(__dirname, '../../src/database');
const migrationsFolder = join(dbBase, './migrations');
const migrations = readMigrationFiles({ migrationsFolder: migrationsFolder });

writeFileSync(
  join(dbBase, './client/migrations.json'),
  JSON.stringify(migrations, null, 2), // null, 2 adds indentation for better readability
);

console.log('🏁 client migrations.json compiled!');
