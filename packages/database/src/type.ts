import type { NeonDatabase } from 'drizzle-orm/neon-serverless';

import * as schema from './schemas';

export type LobeChatDatabaseSchema = typeof schema;

export type LobeChatDatabase = NeonDatabase<LobeChatDatabaseSchema>;

export type Transaction = Parameters<Parameters<LobeChatDatabase['transaction']>[0]>[0];

export const isDesktop = process.env.NEXT_PUBLIC_IS_DESKTOP_APP === '1';
