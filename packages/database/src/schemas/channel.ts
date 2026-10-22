import type {
  ChannelAuditDetails,
  ChannelInputManifest,
  ChannelJobBlockCode,
  ChannelJobStatus,
  ChannelMemberActorType,
  ChannelMemberConfig,
  ChannelMemberGrantRevokeReason,
  ChannelMemberGrantStatus,
  ChannelMemberRole,
  ChannelMessageRoutingSource,
  ChannelMessageRoutingStatus,
  ChannelPublicationStatus,
  ChannelRunAcceptance,
  ChannelRunActivity,
  ChannelRunStatus,
  ChannelVisibility,
  UIChatMessage,
} from '@lobechat/types';
import { sql } from 'drizzle-orm';
import type { PgTableExtraConfigValue } from 'drizzle-orm/pg-core';
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
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
import { users } from './user';
import { workspaces } from './workspace';

/**
 * Channel (LOBE-15104 §4): people and Agents in one shared conversation.
 *
 * Access is by membership, not by creator: a user reaches a channel only through an active
 * `channel_members` row. Every write serializes on the `channels` row lock.
 *
 * Child tables expose `unique (channel_id, id)` so composite foreign keys keep every
 * reference inside its own channel.
 *
 * `channels.revision` is maintained by the triggers in the `channel_revision` migration:
 * any change to the channel, its members, threads, messages, jobs, runs or grants bumps it,
 * and watchers compare it instead of reloading the channel.
 */
export const channels = pgTable(
  'channels',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('channels'))
      .notNull(),
    /** Who created the channel. Authorization reads the owner member, not this column. */
    creatorId: text('creator_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    /** NULL for a personal channel. */
    workspaceId: text('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),

    title: text('title').notNull(),
    /** Last allocated message sequence; incremented under the row lock when a message lands. */
    sequence: integer('sequence').notNull().default(0),
    /** Change counter for watchers; maintained by triggers, never written by the app. */
    revision: integer('revision').notNull().default(0),
    archived: boolean('archived').notNull().default(false),

    /**
     * `public`: any workspace member can find and join. `private`: members only.
     * Ignored for personal channels.
     */
    visibility: text('visibility').$type<ChannelVisibility>().notNull().default('private'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('channels_creator_id_idx').on(t.creatorId),
    index('channels_workspace_visibility_idx').on(t.workspaceId, t.visibility),
  ],
);

/**
 * People and Agents in a channel. Mentions, message authors, Thread followers and read
 * positions all reference this one member identity.
 */
export const channelMembers = pgTable(
  'channel_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('channelMembers'))
      .notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    actorType: text('actor_type').$type<ChannelMemberActorType>().notNull(),

    // Human members
    /**
     * NULL once the account is deleted: the member row stays because messages still
     * reference it, and the person shows as a deleted user.
     */
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    role: text('role').$type<ChannelMemberRole>(),
    /** Highest sequence this person has read in the main channel. */
    lastReadSequence: integer('last_read_sequence'),

    // Agent members
    /** Display name sent to Jev and shown in the roster. Humans resolve theirs from `users`. */
    name: text('name'),
    description: text('description').notNull().default(''),
    config: jsonb('config').$type<ChannelMemberConfig>(),
    executionPaused: boolean('execution_paused').notNull().default(false),
    /** Incremented on every device or directory switch; grants bind to one revision. */
    environmentRevision: integer('environment_revision').notNull().default(0),
    /** Messages at or before this sequence must not run late in the new environment. */
    environmentCutoff: integer('environment_cutoff').notNull().default(0),

    /** False once the member leaves; the row stays because messages still reference it. */
    active: boolean('active').notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('channel_members_scope_unique').on(t.channelId, t.id),
    uniqueIndex('channel_members_channel_user_unique')
      .on(t.channelId, t.userId)
      .where(sql`${t.userId} IS NOT NULL`),
    index('channel_members_user_id_idx').on(t.userId),
    check(
      'channel_members_actor_check',
      sql`(${t.actorType} = 'user' AND ${t.role} IS NOT NULL AND ${t.config} IS NULL)
        OR (${t.actorType} = 'agent' AND ${t.userId} IS NULL AND ${t.role} IS NULL AND ${t.name} IS NOT NULL AND ${t.config} IS NOT NULL)`,
    ),
  ],
);

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
    rootMessageId: text('root_message_id').notNull(),
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

/** Public messages. Immutable once written: there is no edit. */
export const channelMessages = pgTable(
  'channel_messages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('channelMessages'))
      .notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    threadId: text('thread_id'),
    sequence: integer('sequence').notNull(),
    authorMemberId: text('author_member_id').notNull(),
    content: text('content').notNull(),
    fileIds: jsonb('file_ids').$type<string[]>().notNull().default([]),
    /** Mentioned member ids. Mentioned Agents run; mentioned people are only notified. */
    mentions: jsonb('mentions').$type<string[]>().notNull().default([]),
    /** Client retry key for a human message; run identity for a published reply. */
    requestKey: text('request_key').notNull(),
    replyToId: text('reply_to_id'),

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

/** One delivery of one message to one Agent member; each member drains its jobs FIFO. */
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
    memberId: text('member_id').notNull(),
    messageId: text('message_id').notNull(),
    threadId: text('thread_id'),
    /** Member who triggered the request; its user is the execution identity. */
    requesterMemberId: text('requester_member_id').notNull(),
    /** Separates redeliveries of the same message to the same member, e.g. after a retry. */
    deliveryKey: text('delivery_key').notNull().default('initial'),
    status: text('status').$type<ChannelJobStatus>().notNull().default('queued'),
    blockedReason: text('blocked_reason'),
    /** Machine-readable cause for `blockedReason`; clients must not parse the text. */
    blockedCode: text('blocked_code').$type<ChannelJobBlockCode>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('channel_jobs_scope_unique').on(t.channelId, t.id),
    uniqueIndex('channel_jobs_delivery_unique').on(t.messageId, t.memberId, t.deliveryKey),
    index('channel_jobs_channel_status_idx').on(t.channelId, t.status),
    index('channel_jobs_member_queue_idx').on(t.memberId, t.status, t.createdAt),
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

/** An Agent member's runtime session for one branch (main or a Thread). */
export const channelSessions = pgTable(
  'channel_sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('channelSessions'))
      .notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    memberId: text('member_id').notNull(),
    /** `main` or a Thread id; no runtime topic identity. */
    scope: text('scope').notNull(),
    /** Incremented whenever the session is rotated, e.g. after an environment switch. */
    generation: integer('generation').notNull().default(1),
    /** Runtime-side session id used to resume (CLI session or native transcript key). */
    nativeSessionId: text('native_session_id'),
    /**
     * Every message of this branch at or below this sequence has been accepted by the
     * runtime, so incremental input starts after it.
     */
    acceptedSequence: integer('accepted_sequence').notNull().default(0),
    /**
     * Messages above `acceptedSequence` the session already holds, e.g. its own published
     * replies. Pruned once the cursor passes them.
     */
    acceptedAheadMessageIds: jsonb('accepted_ahead_message_ids')
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('channel_sessions_member_scope_unique').on(t.memberId, t.scope),
    foreignKey({
      columns: [t.channelId, t.memberId],
      foreignColumns: [channelMembers.channelId, channelMembers.id],
      name: 'channel_sessions_member_fk',
    }),
  ],
);

/**
 * One execution of a job. Holds two separate fences: `fence` guards publication of the
 * draft, `executionFence` guards device receipts. A writer is released only by physical
 * stop confirmation; when that cannot be confirmed in time the run is isolated instead.
 */
export const channelRuns = pgTable(
  'channel_runs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('channelRuns'))
      .notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    jobId: text('job_id').notNull(),
    memberId: text('member_id').notNull(),
    /** Copied from the job: the member whose user this run executes as. */
    requesterMemberId: text('requester_member_id').notNull(),
    sessionId: text('session_id')
      .references(() => channelSessions.id)
      .notNull(),

    status: text('status').$type<ChannelRunStatus>().notNull().default('starting'),
    activity: text('activity').$type<ChannelRunActivity>(),
    /** Publication authority; bumped when a draft must be republished under new authority. */
    fence: integer('fence').notNull().default(1),
    /** Device receipt authority; never changes when the draft gets a new publication fence. */
    executionFence: integer('execution_fence').notNull().default(1),

    /** Member config frozen at claim time. */
    executionConfig: jsonb('execution_config').$type<ChannelMemberConfig>(),
    environmentRevision: integer('environment_revision').notNull().default(0),
    /** Device of a device-hosted run; with `workingDirectory` it forms the directory lock. */
    deviceId: varchar('device_id', { length: 64 }),
    /** Canonical working directory acknowledged by the device. */
    workingDirectory: text('working_directory'),
    environmentError: text('environment_error'),
    manifest: jsonb('manifest').$type<ChannelInputManifest>().notNull(),
    acceptance: text('acceptance').$type<ChannelRunAcceptance>().notNull().default('pending'),
    nativeTurnId: text('native_turn_id'),

    /** Process (or queue worker) currently driving the run; checked with the fences. */
    leaseOwner: text('lease_owner'),
    leaseExpiresAt: timestamptz('lease_expires_at'),
    heartbeatAt: timestamptz('heartbeat_at'),

    physicalStopped: boolean('physical_stopped').notNull().default(false),
    cleanupRequested: boolean('cleanup_requested').notNull().default(false),
    /** Only physical stop confirmation sets this; leases, idleness and interrupts do not. */
    writerReleased: boolean('writer_released').notNull().default(false),
    /**
     * Set when termination could not be confirmed in time (INC-049). Publication is revoked
     * and the session retired so the member may run again; `writerReleased` and
     * `physicalStopped` still mean physical confirmation only.
     */
    isolatedAt: timestamptz('isolated_at'),

    draft: text('draft'),
    publicationStatus: text('publication_status')
      .$type<ChannelPublicationStatus>()
      .notNull()
      .default('pending'),
    publicationRevoked: boolean('publication_revoked').notNull().default(false),
    publishedMessageId: text('published_message_id'),
    error: text('error'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique('channel_runs_scope_unique').on(t.channelId, t.id),
    uniqueIndex('channel_runs_job_unique').on(t.jobId),
    index('channel_runs_channel_id_idx').on(t.channelId),
    index('channel_runs_unsettled_idx')
      .on(t.channelId, t.id)
      .where(sql`${t.writerReleased} = false OR ${t.physicalStopped} = false`),
    index('channel_runs_lease_expires_idx')
      .on(t.leaseExpiresAt)
      .where(sql`${t.writerReleased} = false AND ${t.isolatedAt} IS NULL`),
    /** At most one writer per member. */
    uniqueIndex('channel_runs_active_member_unique')
      .on(t.memberId)
      .where(sql`${t.writerReleased} = false AND ${t.isolatedAt} IS NULL`),
    /** At most one writer per device directory, across all channels. */
    uniqueIndex('channel_runs_active_directory_unique')
      .on(t.deviceId, t.workingDirectory)
      .where(
        sql`${t.deviceId} IS NOT NULL AND ${t.workingDirectory} IS NOT NULL AND ${t.writerReleased} = false AND ${t.isolatedAt} IS NULL`,
      ),
    foreignKey({
      columns: [t.channelId, t.jobId],
      foreignColumns: [channelJobs.channelId, channelJobs.id],
      name: 'channel_runs_job_fk',
    }),
    foreignKey({
      columns: [t.channelId, t.memberId],
      foreignColumns: [channelMembers.channelId, channelMembers.id],
      name: 'channel_runs_member_fk',
    }),
    foreignKey({
      columns: [t.channelId, t.requesterMemberId],
      foreignColumns: [channelMembers.channelId, channelMembers.id],
      name: 'channel_runs_requester_fk',
    }),
  ],
);

/** Native members' private transcripts. Never shown to anyone, never in `messages`. */
export const channelRuntimeMessages = pgTable(
  'channel_runtime_messages',
  {
    /** Assigned by the agent runtime; transcript entries reference each other by it. */
    id: text('id').primaryKey().notNull(),
    sessionId: text('session_id')
      .references(() => channelSessions.id, { onDelete: 'cascade' })
      .notNull(),
    runId: text('run_id')
      .references(() => channelRuns.id, { onDelete: 'cascade' })
      .notNull(),
    stableKey: text('stable_key').notNull(),
    data: jsonb('data').$type<UIChatMessage>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('channel_runtime_messages_session_key_unique').on(t.sessionId, t.stableKey)],
);

/** Latest agent-runtime checkpoint of a native session. */
export const channelRuntimeStates = pgTable('channel_runtime_states', {
  sessionId: text('session_id')
    .primaryKey()
    .references(() => channelSessions.id, { onDelete: 'cascade' })
    .notNull(),
  runId: text('run_id')
    .references(() => channelRuns.id, { onDelete: 'cascade' })
    .notNull(),
  /** Serialized `AgentState` from `@lobechat/agent-runtime`, which this package cannot import. */
  state: jsonb('state').$type<Record<string, unknown>>().notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/**
 * Approval to run an Agent member on someone's personal device (or a private shared one).
 * Binds to one (member, device, directory, environment revision); a switch needs a new grant.
 * An approved grant covers every current and future person in the channel.
 */
export const channelMemberGrants = pgTable(
  'channel_member_grants',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('channelMemberGrants'))
      .notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    memberId: text('member_id').notNull(),
    /** Device owner who approves, rejects or revokes. */
    deviceOwnerId: text('device_owner_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    deviceId: varchar('device_id', { length: 64 }).notNull(),
    /** Canonical path, so `/repo` and `/repo/` bind to the same grant. */
    workingDirectory: text('working_directory').notNull(),
    environmentRevision: integer('environment_revision').notNull(),
    /** Person who pulled the member in or switched its environment. */
    requestedByMemberId: text('requested_by_member_id').notNull(),

    status: text('status').$type<ChannelMemberGrantStatus>().notNull().default('pending'),
    decidedAt: timestamptz('decided_at'),
    revokedAt: timestamptz('revoked_at'),
    revokeReason: text('revoke_reason').$type<ChannelMemberGrantRevokeReason>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('channel_member_grants_member_revision_unique').on(
      t.memberId,
      t.environmentRevision,
    ),
    index('channel_member_grants_owner_status_idx').on(t.deviceOwnerId, t.status),
    foreignKey({
      columns: [t.channelId, t.memberId],
      foreignColumns: [channelMembers.channelId, channelMembers.id],
      name: 'channel_member_grants_member_fk',
    }),
    foreignKey({
      columns: [t.channelId, t.requestedByMemberId],
      foreignColumns: [channelMembers.channelId, channelMembers.id],
      name: 'channel_member_grants_requester_fk',
    }),
  ],
);

export const channelAudit = pgTable(
  'channel_audit',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    /** e.g. `routing_decided`, `run_claimed`, `writer_isolated`. */
    event: text('event').notNull(),
    targetId: text('target_id').notNull(),
    details: jsonb('details').$type<ChannelAuditDetails>().notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index('channel_audit_channel_event_idx').on(t.channelId, t.event, t.createdAt),
    index('channel_audit_target_event_idx').on(t.targetId, t.event, t.createdAt),
  ],
);

export type ChannelItem = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
export type ChannelMemberItem = typeof channelMembers.$inferSelect;
export type NewChannelMember = typeof channelMembers.$inferInsert;
export type ChannelThreadItem = typeof channelThreads.$inferSelect;
export type ChannelMessageItem = typeof channelMessages.$inferSelect;
export type NewChannelMessage = typeof channelMessages.$inferInsert;
export type ChannelJobItem = typeof channelJobs.$inferSelect;
export type ChannelSessionItem = typeof channelSessions.$inferSelect;
export type ChannelRunItem = typeof channelRuns.$inferSelect;
export type ChannelMemberGrantItem = typeof channelMemberGrants.$inferSelect;
