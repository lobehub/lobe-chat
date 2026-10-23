import type {
  ChannelInputManifest,
  ChannelJobBlockCode,
  ChannelJobStatus,
  ChannelMemberConfig,
} from '@lobechat/types';
import { sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import {
  boolean,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { idGenerator } from '../utils/idGenerator';
import { createdAt, timestamptz, updatedAt } from './_helpers';
import { agentOperations } from './agentOperations';
import { channelMembers, channels } from './channel';
import { channelMessages, channelThreads } from './channelMessage';
import { topics } from './topic';

/**
 * One delivery of one message to one Agent member; each member drains its jobs FIFO.
 *
 * Claiming a job reserves one canonical `agent_operations` row in a normal Agent
 * topic (continued when safe); execution status, errors, usage and traces live on the
 * operation. The job keeps only what the operation cannot: the frozen input, the execution
 * lease, the writer lock and publication of the final reply.
 */
export const channelJobs = pgTable(
  'channel_jobs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('channelJobs'))
      .notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    memberId: uuid('member_id').notNull(),
    messageId: text('message_id').notNull(),
    threadId: text('thread_id'),
    /** Member who triggered the request; its user is the execution identity. */
    requesterMemberId: uuid('requester_member_id').notNull(),
    /** Separates redeliveries of the same message to the same member, e.g. after a retry. */
    deliveryKey: text('delivery_key').notNull().default('initial'),
    /**
     * Channel outcome of this delivery. It may settle while the writer is still held, e.g. a
     * stop cancels the job before the process exits; the locks follow `writerHeld`.
     */
    status: text('status').$type<ChannelJobStatus>().notNull().default('queued'),
    blockedReason: text('blocked_reason'),
    /** Machine-readable cause for `blockedReason`; clients must not parse the text. */
    blockedCode: text('blocked_code').$type<ChannelJobBlockCode>(),

    // Execution, set when the job is claimed
    /** Actual claim time under the Channel lock; delayed routing can invert request order. */
    claimedAt: timestamptz('claimed_at'),
    /** Source-side link to the ordinary Agent conversation. */
    topicId: text('topic_id').references(() => topics.id, { onDelete: 'set null' }),
    /** Canonical execution reserved at claim time; NULL while the job waits. */
    operationId: text('operation_id')
      .unique()
      .references((): AnyPgColumn => agentOperations.id, { onDelete: 'set null' }),
    /** Where the run's input ends, frozen at claim; later messages belong to the next job. */
    manifest: jsonb('manifest').$type<ChannelInputManifest>(),
    /** Member config frozen at claim time. */
    executionConfig: jsonb('execution_config').$type<ChannelMemberConfig>(),
    /** Device of a device-hosted run; with `workingDirectory` it forms the directory lock. */
    deviceId: varchar('device_id', { length: 64 }),
    /** Canonical working directory acknowledged by the device. */
    workingDirectory: text('working_directory'),
    /** When the runtime confirmed it took the input. An unknown delivery never gets one. */
    acceptedAt: timestamptz('accepted_at'),
    /** Process (or queue worker) currently driving the run. */
    leaseOwner: text('lease_owner'),
    leaseExpiresAt: timestamptz('lease_expires_at'),
    /**
     * Set when the job is claimed. Cleared only by physical stop confirmation (process tree
     * ended, or the native operation finished) or a trusted failure before dispatch, when
     * nothing ran. Leases, idleness, interrupts and operation completion do not clear it.
     */
    writerHeld: boolean('writer_held').notNull().default(false),
    /**
     * Set when termination could not be confirmed in time (INC-049). Publication is revoked so
     * the member may run again, though not in the same device directory until the stop is
     * confirmed: isolation frees the member lock but never `writerHeld`.
     */
    isolatedAt: timestamptz('isolated_at'),
    /** Final answer saved by the run; immutable once set. */
    draft: text('draft'),
    /** A revoked job never publishes. Set by stops, failures and isolation. */
    publicationRevoked: boolean('publication_revoked').notNull().default(false),
    publishedMessageId: text('published_message_id'),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('channel_jobs_scope_unique').on(t.channelId, t.id),
    uniqueIndex('channel_jobs_delivery_unique').on(t.messageId, t.memberId, t.deliveryKey),
    index('channel_jobs_channel_status_idx').on(t.channelId, t.status),
    index('channel_jobs_continuation_idx').on(
      t.memberId,
      t.requesterMemberId,
      t.threadId,
      t.claimedAt,
    ),
    index('channel_jobs_topic_idx').on(t.topicId, t.publishedMessageId),
    index('channel_jobs_member_queue_idx').on(t.memberId, t.status, t.createdAt),
    index('channel_jobs_lease_expires_idx')
      .on(t.leaseExpiresAt)
      .where(sql`${t.writerHeld} AND ${t.isolatedAt} IS NULL`),
    /** At most one writer per member. */
    uniqueIndex('channel_jobs_active_member_unique')
      .on(t.memberId)
      .where(sql`${t.writerHeld} AND ${t.isolatedAt} IS NULL`),
    /**
     * At most one writer per device directory, across all channels. Unlike the member lock,
     * isolation does not release it: only physical stop confirmation proves the old process
     * has left the directory.
     */
    uniqueIndex('channel_jobs_active_directory_unique')
      .on(t.deviceId, t.workingDirectory)
      .where(
        sql`${t.deviceId} IS NOT NULL AND ${t.workingDirectory} IS NOT NULL AND ${t.writerHeld}`,
      ),
    foreignKey({
      columns: [t.channelId, t.memberId],
      foreignColumns: [channelMembers.channelId, channelMembers.id],
      name: 'channel_jobs_member_fk',
    }),
    foreignKey({
      columns: [t.channelId, t.requesterMemberId],
      foreignColumns: [channelMembers.channelId, channelMembers.id],
      name: 'channel_jobs_requester_fk',
    }),
    foreignKey({
      columns: [t.channelId, t.messageId],
      foreignColumns: [channelMessages.channelId, channelMessages.id],
      name: 'channel_jobs_message_fk',
    }),
    foreignKey({
      columns: [t.channelId, t.threadId],
      foreignColumns: [channelThreads.channelId, channelThreads.id],
      name: 'channel_jobs_thread_fk',
    }),
  ],
);

export type ChannelJobItem = typeof channelJobs.$inferSelect;
