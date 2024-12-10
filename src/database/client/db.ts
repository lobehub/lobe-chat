import { IdbFs, PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite/vector';
import { drizzle } from 'drizzle-orm/pglite';

import * as schema from '../schemas';

const client = new PGlite({
  extensions: { vector },
  fs: new IdbFs('lobechat'),
  relaxedDurability: true,
});

export const clientDB = drizzle({ client, schema });
