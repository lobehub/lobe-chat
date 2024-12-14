import { sql } from 'drizzle-orm';

import { files } from '../schemas';

export const fileUrl = (domain: string = '') => {
  const prefix = domain.endsWith('/') ? domain : `${domain}/`;

  return sql<string>`${prefix} || ${files.url}`;
};
