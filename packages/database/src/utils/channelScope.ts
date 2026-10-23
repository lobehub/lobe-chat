import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

import { messages } from '../schemas/message';
import { topics } from '../schemas/topic';

/**
 * Channel data is not an ordinary workspace conversation. Generic read/write paths fail
 * closed, including child rows reached without loading their message or topic first.
 * A trusted runtime may opt into ONE channel under its execution user's identity; this
 * is not a membership grant and must never be sourced from a public API input.
 */
export const channelScopeWhere = (userIdColumn: AnyPgColumn, channelId?: string) => {
  const columns = getTableColumns(userIdColumn.table);
  const tableName = Reflect.get(userIdColumn.table, Symbol.for('drizzle:OriginalName')) as string;
  const match = (column: AnyPgColumn) =>
    channelId === undefined ? isNull(column) : eq(column, channelId);
  const channelColumn = columns.channelId as AnyPgColumn | undefined;
  const predicates = channelColumn ? [match(channelColumn)] : [];

  // An explicit alias keeps correlated references intact in Drizzle relational queries.
  const topicId = columns.topicId as AnyPgColumn | undefined;
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

  // Plugins use the message id as their PK; attachment/query rows have a messageId.
  const messageId = (columns.messageId ??
    (['message_plugins', 'message_translates', 'message_tts'].includes(tableName)
      ? columns.id
      : undefined)) as AnyPgColumn | undefined;
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
