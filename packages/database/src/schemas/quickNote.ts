import type { QuickNoteRunKind, QuickNoteRunStatus } from '@lobechat/types';
import { sql } from 'drizzle-orm';
import { index, pgTable, text, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { idGenerator } from '../utils/idGenerator';
import { createdAt, timestamps, timestamptz } from './_helpers';
import { agentOperations } from './agentOperations';
import { documentHistories } from './documentHistory';
import { documents } from './file';
import { threads, topics } from './topic';
import { users } from './user';
import { workspaces } from './workspace';

/**
 * Quick Note captures and their stable backing containers.
 *
 * Content lives in `documents`; this table owns Quick Note organization and
 * the hidden Topic used by future Dive conversations.
 */
export const quickNotes = pgTable(
  'quick_notes',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('quickNotes'))
      .primaryKey(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    workspaceId: text('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
    documentId: varchar('document_id', { length: 255 })
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),
    topicId: text('topic_id')
      .references(() => topics.id, { onDelete: 'cascade' })
      .notNull(),
    tags: text('tags').array().default([]).notNull(),
    collection: text('collection'),
    location: text('location'),
    discoveryDueAt: timestamptz('discovery_due_at'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('quick_notes_document_id_unique').on(table.documentId),
    uniqueIndex('quick_notes_topic_id_unique').on(table.topicId),
    index('quick_notes_user_id_idx').on(table.userId),
    index('quick_notes_workspace_id_idx').on(table.workspaceId),
    index('quick_notes_discovery_due_at_idx').on(table.discoveryDueAt),
  ],
);

/** A persisted Quick Note capture. */
export type QuickNoteItem = typeof quickNotes.$inferSelect;

/** Values accepted when inserting a Quick Note capture. */
export type NewQuickNote = typeof quickNotes.$inferInsert;

/**
 * Immutable processing attempts over one pinned Quick Note Document History.
 */
export const quickNoteRuns = pgTable(
  'quick_note_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    quickNoteId: text('quick_note_id')
      .references(() => quickNotes.id, { onDelete: 'cascade' })
      .notNull(),
    sourceHistoryId: varchar('source_history_id', { length: 255 })
      .references(() => documentHistories.id, { onDelete: 'cascade' })
      .notNull(),
    threadId: text('thread_id').references(() => threads.id, { onDelete: 'set null' }),
    operationId: text('operation_id').references(() => agentOperations.id, {
      onDelete: 'set null',
    }),
    kind: text('kind').$type<QuickNoteRunKind>().notNull(),
    status: text('status').$type<QuickNoteRunStatus>().default('pending').notNull(),
    error: text('error'),
    startedAt: timestamptz('started_at'),
    completedAt: timestamptz('completed_at'),
    ...timestamps,
  },
  (table) => [
    index('quick_note_runs_quick_note_id_idx').on(table.quickNoteId),
    index('quick_note_runs_source_history_id_idx').on(table.sourceHistoryId),
    index('quick_note_runs_thread_id_idx').on(table.threadId),
    uniqueIndex('quick_note_runs_operation_id_unique').on(table.operationId),
    uniqueIndex('quick_note_runs_active_kind_unique')
      .on(table.quickNoteId, table.kind)
      .where(sql`${table.status} IN ('pending', 'running')`),
    index('quick_note_runs_status_idx').on(table.status),
  ],
);

/** A persisted immutable Quick Note processing attempt. */
export type QuickNoteRunItem = typeof quickNoteRuns.$inferSelect;

/** Values accepted when inserting a Quick Note processing attempt. */
export type NewQuickNoteRun = typeof quickNoteRuns.$inferInsert;

/**
 * Canonical Document resources associated with a particular source revision.
 */
export const quickNoteResources = pgTable(
  'quick_note_resources',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    quickNoteId: text('quick_note_id')
      .references(() => quickNotes.id, { onDelete: 'cascade' })
      .notNull(),
    sourceHistoryId: varchar('source_history_id', { length: 255 })
      .references(() => documentHistories.id, { onDelete: 'cascade' })
      .notNull(),
    documentId: varchar('document_id', { length: 255 })
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),
    role: text('role').notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    workspaceId: text('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('quick_note_resources_identity_unique').on(
      table.quickNoteId,
      table.sourceHistoryId,
      table.documentId,
      table.role,
    ),
    uniqueIndex('quick_note_resources_annotation_unique')
      .on(table.quickNoteId, table.sourceHistoryId, table.role)
      .where(sql`${table.role} = 'annotation'`),
    index('quick_note_resources_quick_note_id_idx').on(table.quickNoteId),
    index('quick_note_resources_source_history_id_idx').on(table.sourceHistoryId),
    index('quick_note_resources_document_id_idx').on(table.documentId),
    index('quick_note_resources_user_id_idx').on(table.userId),
    index('quick_note_resources_workspace_id_idx').on(table.workspaceId),
  ],
);

/** A canonical resource linked to one Quick Note source revision. */
export type QuickNoteResourceItem = typeof quickNoteResources.$inferSelect;

/** Values accepted when linking a canonical Quick Note resource. */
export type NewQuickNoteResource = typeof quickNoteResources.$inferInsert;

/**
 * Append-only evidence that a Run created or updated a resource revision.
 */
export const quickNoteRunResources = pgTable(
  'quick_note_run_resources',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    runId: uuid('run_id')
      .references(() => quickNoteRuns.id, { onDelete: 'cascade' })
      .notNull(),
    resourceId: uuid('resource_id')
      .references(() => quickNoteResources.id, { onDelete: 'cascade' })
      .notNull(),
    documentHistoryId: varchar('document_history_id', { length: 255 }).references(
      () => documentHistories.id,
      { onDelete: 'set null' },
    ),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    workspaceId: text('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('quick_note_run_resources_identity_unique').on(table.runId, table.resourceId),
    index('quick_note_run_resources_run_id_idx').on(table.runId),
    index('quick_note_run_resources_resource_id_idx').on(table.resourceId),
    index('quick_note_run_resources_document_history_id_idx').on(table.documentHistoryId),
    index('quick_note_run_resources_user_id_idx').on(table.userId),
    index('quick_note_run_resources_workspace_id_idx').on(table.workspaceId),
  ],
);

/** A Run-to-resource output revision link. */
export type QuickNoteRunResourceItem = typeof quickNoteRunResources.$inferSelect;

/** Values accepted when linking a Run to a resource revision. */
export type NewQuickNoteRunResource = typeof quickNoteRunResources.$inferInsert;
