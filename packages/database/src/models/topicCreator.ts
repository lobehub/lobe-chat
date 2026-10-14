import type { ChatTopicMetadata } from '@lobechat/types';
import { and, asc, eq, type SQL, sql } from 'drizzle-orm';

import { messages, topics } from '../schemas';
import type { LobeChatDatabase } from '../type';

/** Resolve the initiator, never the latest participant or the bot owner. */
export const topicMetadataWithCreator = (db: LobeChatDatabase, ownership?: SQL) => {
  const firstSender = db
    .select({ value: sql`${messages.metadata}->'botSender'` })
    .from(messages)
    .where(and(eq(messages.topicId, topics.id), eq(messages.role, 'user'), ownership))
    .orderBy(asc(messages.createdAt), asc(messages.id))
    .limit(1);

  return sql<ChatTopicMetadata | null>`CASE
    WHEN ${topics.metadata}->'bot' IS NOT NULL
    THEN ${topics.metadata} || jsonb_build_object('botCreator', (${firstSender}))
    ELSE ${topics.metadata}
  END`;
};
