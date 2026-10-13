import type { ProjectMemberRole, ProjectMemberStatus } from '@lobechat/types';
import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { idGenerator } from '../utils/idGenerator';
import { timestamps, timestamptz } from './_helpers';
import { projects } from './project';
import { users } from './user';
import { acceptances } from './verify';
import { workspaces } from './workspace';

export const projectSites = pgTable(
  'project_sites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('projectSites'))
      .notNull(),
    projectId: text('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    workspaceId: text('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
    createdByUserId: text('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    siteKey: text('site_key')
      .$defaultFn(() => idGenerator('projectSiteKeys'))
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    origins: text('origins').array().notNull(),
    acceptanceId: uuid('acceptance_id').references(() => acceptances.id, { onDelete: 'set null' }),

    ...timestamps,
  },
  (t) => [
    uniqueIndex('project_sites_site_key_unique').on(t.siteKey),
    index('project_sites_project_id_idx').on(t.projectId),
    index('project_sites_workspace_id_idx').on(t.workspaceId),
    check('project_sites_name_not_empty', sql`length(btrim(${t.name})) > 0`),
    check('project_sites_origins_not_empty', sql`cardinality(${t.origins}) > 0`),
  ],
);

export type NewProjectSite = typeof projectSites.$inferInsert;
export type ProjectSiteItem = typeof projectSites.$inferSelect;

export const projectMembers = pgTable(
  'project_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('projectMembers'))
      .notNull(),
    projectId: text('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    invitedByUserId: text('invited_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    email: varchar('email', { length: 320 }).notNull(),
    role: text('role').$type<ProjectMemberRole>().notNull().default('reviewer'),
    status: text('status').$type<ProjectMemberStatus>().notNull().default('pending'),
    inviteToken: text('invite_token'),
    expiresAt: timestamptz('expires_at'),
    acceptedAt: timestamptz('accepted_at'),

    ...timestamps,
  },
  (t) => [
    uniqueIndex('project_members_project_email_active_unique')
      .on(t.projectId, t.email)
      .where(sql`${t.status} <> 'revoked'`),
    uniqueIndex('project_members_invite_token_unique').on(t.inviteToken),
    index('project_members_project_id_idx').on(t.projectId),
    index('project_members_user_id_idx').on(t.userId),
  ],
);

export type NewProjectMember = typeof projectMembers.$inferInsert;
export type ProjectMemberItem = typeof projectMembers.$inferSelect;
