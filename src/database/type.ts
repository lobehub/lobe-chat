import type { NeonDatabase } from 'drizzle-orm/neon-serverless';

import * as schema from './schemas';

export type LobeChatDatabaseSchema = typeof schema;

export type LobeChatDatabase = NeonDatabase<LobeChatDatabaseSchema>;
