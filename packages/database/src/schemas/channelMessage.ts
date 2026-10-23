import type { ChannelMessageRoutingSource, ChannelMessageRoutingStatus } from '@lobechat/types';
import { sql } from 'drizzle-orm';
import type { PgTableExtraConfigValue } from 'drizzle-orm/pg-core';
import {
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { idGenerator } from '../utils/idGenerator';
import { createdAt } from './_helpers';
import { channelMembers, channels } from './channel';
import { files } from './file';

export const channelThreads = pgTable(
  'channel_threads',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('channelThreads'))
      .notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    rootMessageId: uuid('root_message_id').notNull(),
    rootSequence: integer('root_sequence').notNull(),
    /** Member ids (people and Agents) following this Thread. */
    followerMemberIds: jsonb('follower_member_ids').$type<string[]>().notNull().default([]),
    createdAt: createdAt(),
  },
  // Threads and messages reference each other; the annotation breaks the type cycle.
  (t): PgTableExtraConfigValue[] => [
    unique('channel_threads_scope_unique').on(t.channelId, t.id),
    uniqueIndex('channel_threads_root_unique').on(t.channelId, t.rootMessageId),
    foreignKey({
      columns: [t.channelId, t.rootMessageId],
      foreignColumns: [channelMessages.channelId, channelMessages.id],
      name: 'channel_threads_root_fk',
    }),
  ],
);

/** Public Channel timeline, independent of Agent conversation messages. */
export const channelMessages = pgTable(
  'channel_messages',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    threadId: text('thread_id'),
    sequence: integer('sequence').notNull(),
    content: text('content').notNull(),
    authorMemberId: uuid('author_member_id').notNull(),
    /** Mentioned member ids. Mentioned Agents run; mentioned people are only notified. */
    mentions: jsonb('mentions').$type<string[]>().notNull().default([]),
    /** Client retry key for a human message; run identity for a published reply. */
    requestKey: text('request_key').notNull(),
    replyToId: uuid('reply_to_id'),

    routingStatus: text('routing_status').$type<ChannelMessageRoutingStatus>().notNull(),
    /** Where the recipients came from. NULL until routing settles, and on replies. */
    routingSource: text('routing_source').$type<ChannelMessageRoutingSource>(),
    /** Human-readable explanation of why these recipients (or none) were chosen. */
    routingReason: text('routing_reason'),
    /**
     * Incremented each time routing starts. A `decide()` result is written back only when its
     * attempt still matches, so a late answer cannot overwrite a retry.
     */
    routingAttempt: integer('routing_attempt').notNull().default(0),
    /** Agent member ids that actually received a job for this message. */
    recipientMemberIds: jsonb('recipient_member_ids').$type<string[]>().notNull().default([]),

    createdAt: createdAt(),
  },
  // Threads and messages reference each other; the annotation breaks the type cycle.
  (t): PgTableExtraConfigValue[] => [
    unique('channel_messages_scope_unique').on(t.channelId, t.id),
    uniqueIndex('channel_messages_sequence_unique').on(t.channelId, t.sequence),
    uniqueIndex('channel_messages_request_key_unique').on(t.channelId, t.requestKey),
    index('channel_messages_thread_sequence_idx').on(t.channelId, t.threadId, t.sequence),
    /** Latest request per branch, without scanning Agent replies. */
    index('channel_messages_request_sequence_idx')
      .on(t.channelId, t.threadId, t.sequence)
      .where(sql`${t.routingStatus} <> 'reply'`),
    index('channel_messages_routing_pending_idx')
      .on(t.channelId, t.id)
      .where(sql`${t.routingStatus} = 'pending'`),
    foreignKey({
      columns: [t.channelId, t.threadId],
      foreignColumns: [channelThreads.channelId, channelThreads.id],
      name: 'channel_messages_thread_fk',
    }),
    foreignKey({
      columns: [t.channelId, t.authorMemberId],
      foreignColumns: [channelMembers.channelId, channelMembers.id],
      name: 'channel_messages_author_fk',
    }),
  ],
);

export type ChannelThreadItem = typeof channelThreads.$inferSelect;
export type ChannelMessageItem = typeof channelMessages.$inferSelect;
export type NewChannelMessage = typeof channelMessages.$inferInsert;

/** Public attachment links are independent of internal conversation messages. */
export const channelMessageFiles = pgTable(
  'channel_message_files',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    messageId: uuid('message_id')
      .references(() => channelMessages.id, { onDelete: 'cascade' })
      .notNull(),
    fileId: text('file_id')
      .references(() => files.id, { onDelete: 'cascade' })
      .notNull(),
    sortOrder: integer('sort_order').notNull(),
  },
  (t) => [
    unique('channel_message_files_message_file_unique').on(t.messageId, t.fileId),
    index('channel_message_files_file_idx').on(t.fileId),
  ],
);
