import type { upstashCache } from 'drizzle-orm/cache/upstash';

export type DrizzleCache = ReturnType<typeof upstashCache> | undefined;
