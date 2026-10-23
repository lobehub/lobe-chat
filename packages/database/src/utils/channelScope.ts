import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';
import { getTableConfig } from 'drizzle-orm/pg-core';

import { messages } from '../schemas/message';
import { topics } from '../schemas/topic';

interface ParentRefs {
  messageId?: AnyPgColumn;
  topicId?: AnyPgColumn;
}

const parentRefsByTable = new WeakMap<PgTable, ParentRefs>();

/**
 * The topic and message a row belongs to, taken from declared foreign keys rather than column
 * names: `topicId` must reference `topics.id`, and `messageId` (or the primary key of a
 * message's one-to-one child, such as `message_plugins.id`) must reference `messages.id`.
 * A column that only records an id is not a parent: `llm_generation_tracing.topic_id` keeps
 * its rows after the topic is deleted, and `agent_mails.message_id` holds an email Message-ID.
 */
const parentRefs = (table: PgTable): ParentRefs => {
  const cached = parentRefsByTable.get(table);
  if (cached) return cached;

  const columns = getTableColumns(table) as Record<string, AnyPgColumn | undefined>;
  const foreignKeys = getTableConfig(table).foreignKeys.map((fk) => fk.reference());
  const referencing = (column: AnyPgColumn | undefined, parent: PgTable) =>
    column &&
    foreignKeys.some(
      (ref) =>
        ref.foreignTable === parent &&
        ref.columns.length === 1 &&
        ref.columns[0].name === column.name,
    )
      ? column
      : undefined;

  const refs: ParentRefs = {
    messageId: referencing(columns.messageId, messages) ?? referencing(columns.id, messages),
    topicId: referencing(columns.topicId, topics),
  };
  parentRefsByTable.set(table, refs);
  return refs;
};

/**
 * Channel data is not an ordinary workspace conversation. Generic read/write paths fail
 * closed, including child rows reached without loading their message or topic first.
 * A trusted runtime may opt into ONE channel under its execution user's identity; this
 * is not a membership grant and must never be sourced from a public API input.
 */
export const channelScopeWhere = (userIdColumn: AnyPgColumn, channelId?: string) => {
  const table = userIdColumn.table as PgTable;
  const columns = getTableColumns(table);
  const match = (column: AnyPgColumn) =>
    channelId === undefined ? isNull(column) : eq(column, channelId);
  const channelColumn = columns.channelId as AnyPgColumn | undefined;
  const predicates = channelColumn ? [match(channelColumn)] : [];
  const { messageId, topicId } = parentRefs(table);

  // An explicit alias keeps correlated references intact in Drizzle relational queries.
  if (topicId) {
    const parentScope =
      channelId === undefined
        ? sql`"channel_scope_topic"."channel_id" IS NULL`
        : sql`"channel_scope_topic"."channel_id" = ${channelId}`;
    predicates.push(sql`(${topicId} IS NULL OR EXISTS (
      SELECT 1 FROM ${topics} AS "channel_scope_topic"
      WHERE "channel_scope_topic"."id" = ${topicId} AND ${parentScope}
    ))`);
  }

  if (messageId) {
    const parentScope =
      channelId === undefined
        ? sql`"channel_scope_message"."channel_id" IS NULL`
        : sql`"channel_scope_message"."channel_id" = ${channelId}`;
    const topicScope =
      channelId === undefined
        ? sql`"channel_scope_message_topic"."channel_id" IS NULL`
        : sql`"channel_scope_message_topic"."channel_id" = ${channelId}`;
    predicates.push(sql`(${messageId} IS NULL OR EXISTS (
      SELECT 1 FROM ${messages} AS "channel_scope_message"
      WHERE "channel_scope_message"."id" = ${messageId} AND ${parentScope}
        AND ("channel_scope_message"."topic_id" IS NULL OR EXISTS (
          SELECT 1 FROM ${topics} AS "channel_scope_message_topic"
          WHERE "channel_scope_message_topic"."id" = "channel_scope_message"."topic_id"
            AND ${topicScope}
        ))
    ))`);
  }

  return and(...predicates);
};

/**
 * Excludes Channel rows for code that scopes `table` by owner directly instead of through
 * `buildWorkspaceWhere`: digests, self-learning, summaries. Same rule as the default
 * {@link channelScopeWhere}; AND it in next to the `notShareVisitor*` predicates.
 */
export const notChannelData = (table: { userId: AnyPgColumn }) => channelScopeWhere(table.userId);
