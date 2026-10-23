import type {
  ChannelAuditDetails,
  ChannelMemberActorType,
  ChannelMemberConfig,
  ChannelMemberGrantRevokeReason,
  ChannelMemberGrantStatus,
  ChannelMemberRole,
  ChannelVisibility,
} from '@lobechat/types';
import { sql } from 'drizzle-orm';
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
import { agents } from './agent';
import { projects } from './project';
import { users } from './user';
import { workspaces } from './workspace';

/**
 * Channel (LOBE-15104 §4): people and Agents in one shared conversation.
 *
 * Access is by membership, not by creator: a user reaches a channel only through an active
 * `channel_members` row. Every write first locks the `channels` row, then touches child rows,
 * so writers always take locks in the same order.
 *
 * Child tables expose `unique (channel_id, id)` so composite foreign keys keep every
 * reference inside its own channel.
 */
export const channels = pgTable(
  'channels',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('channels'))
      .notNull(),
    /**
     * Creator and personal-channel device/cleanup boundary. Channel access and role
     * permissions are checked through membership.
     * NULL once that account is deleted: a workspace channel outlives its creator, while
     * personal channels are deleted explicitly with the account (`UserModel.deleteUser`).
     */
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    /** NULL for a personal channel. */
    workspaceId: text('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
    /** Optional project association; deleting the project preserves the channel. */
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),

    title: text('title').notNull(),
    /** Last allocated message sequence; incremented under the row lock when a message lands. */
    sequence: integer('sequence').notNull().default(0),
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
    index('channels_user_id_idx').on(t.userId),
    index('channels_project_id_idx')
      .on(t.projectId)
      .where(sql`${t.projectId} IS NOT NULL`),
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
    id: uuid('id').defaultRandom().primaryKey().notNull(),
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
    /** NULL after Agent deletion; keep membership and authored history. */
    agentId: text('agent_id').references(() => agents.id, { onDelete: 'set null' }),
    /** Channel identity label, retained for authored history; not an Agent configuration copy. */
    name: text('name'),
    description: text('description').notNull().default(''),
    /** Channel-specific device/directory environment only. */
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
    index('channel_members_agent_id_idx').on(t.agentId),
    // One constraint per rule, so a new actor type adds constraints instead of rewriting these.
    check('channel_members_actor_type_check', sql`${t.actorType} IN ('user', 'agent')`),
    check(
      'channel_members_user_shape_check',
      sql`${t.actorType} <> 'user' OR ${t.role} IS NOT NULL`,
    ),
    check(
      'channel_members_agent_shape_check',
      sql`${t.actorType} <> 'agent' OR (${t.name} IS NOT NULL AND ${t.config} IS NOT NULL)`,
    ),
    // Membership lookups match on `user_id`, so only a person may carry one.
    check(
      'channel_members_user_id_owner_check',
      sql`${t.userId} IS NULL OR ${t.actorType} = 'user'`,
    ),
    check('channel_members_role_owner_check', sql`${t.role} IS NULL OR ${t.actorType} = 'user'`),
    check(
      'channel_members_agent_id_owner_check',
      sql`${t.agentId} IS NULL OR ${t.actorType} = 'agent'`,
    ),
    check(
      'channel_members_config_owner_check',
      sql`${t.config} IS NULL OR ${t.actorType} <> 'user'`,
    ),
  ],
);

/**
 * Approval to run an Agent member on someone's personal device (or a private shared one).
 * Binds to one (member, device, directory, environment revision); a switch needs a new grant.
 * An approved grant covers every current and future person in the channel.
 */
export const channelMemberGrants = pgTable(
  'channel_member_grants',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    channelId: text('channel_id')
      .references(() => channels.id, { onDelete: 'cascade' })
      .notNull(),
    memberId: uuid('member_id').notNull(),
    /** Device owner who approves, rejects or revokes. */
    deviceOwnerId: text('device_owner_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    deviceId: varchar('device_id', { length: 64 }).notNull(),
    /** Canonical path, so `/repo` and `/repo/` bind to the same grant. */
    workingDirectory: text('working_directory').notNull(),
    environmentRevision: integer('environment_revision').notNull(),
    /** Person who pulled the member in or switched its environment. */
    requestedByMemberId: uuid('requested_by_member_id').notNull(),

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
export type ChannelMemberGrantItem = typeof channelMemberGrants.$inferSelect;
