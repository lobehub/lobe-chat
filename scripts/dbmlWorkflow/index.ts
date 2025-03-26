import { pgGenerate } from 'drizzle-dbml-generator';
import { join } from 'node:path';

import * as schema from '../../src/database/schemas';

const out = join(__dirname,'../../docs/developer/database-schema.dbml');
const relational = true;

pgGenerate({ out, relational, schema });

console.log('🏁 dbml generated successful!');
