import { IdbFs, PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite/vector';
import { drizzle } from 'drizzle-orm/pglite';

import * as schema from '../schemas';
import migrations from './migrations.json';

const client = new PGlite({
  extensions: { vector },
  fs: new IdbFs('lobechat'),
  relaxedDurability: true,
});

export const clientDB = drizzle({ client, schema });

//prevent multiple schema migrations to be run
let isLocalDBSchemaSynced = false;

export const migrate = async (skipMultiRun = false) => {
  if (isLocalDBSchemaSynced && skipMultiRun) return;

  const start = Date.now();
  try {
    // @ts-expect-error
    await clientDB.dialect.migrate(migrations, clientDB.session, {});
    isLocalDBSchemaSynced = true;

    console.info(`✅ Local database ready in ${Date.now() - start}ms`);
  } catch (cause) {
    console.error('❌ Local database schema migration failed', cause);
    throw cause;
  }

  return clientDB;
};
