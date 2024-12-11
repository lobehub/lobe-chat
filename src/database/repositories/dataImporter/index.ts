import { eq, inArray, sql } from 'drizzle-orm';
import { and } from 'drizzle-orm/expressions';

import {
  agents,
  agentsToSessions,
  messagePlugins,
  messageTranslates,
  messages,
  sessionGroups,
  sessions,
  topics,
} from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { ImportResult } from '@/services/config';
import { ImporterEntryData } from '@/types/importer';

export class DataImporterRepos {
  private userId: string;
  private db: LobeChatDatabase;

  /**
   * The version of the importer that this module supports
   */
  supportVersion = 7;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  importData = async (data: ImporterEntryData) => {
    if (data.version > this.supportVersion) throw new Error('Unsupported version');

    let sessionGroupResult: ImportResult = { added: 0, errors: 0, skips: 0 };
    let sessionResult: ImportResult = { added: 0, errors: 0, skips: 0 };
    let topicResult: ImportResult = { added: 0, errors: 0, skips: 0 };
    let messageResult: ImportResult = { added: 0, errors: 0, skips: 0 };

    let sessionGroupIdMap: Record<string, string> = {};
    let sessionIdMap: Record<string, string> = {};
    let topicIdMap: Record<string, string> = {};

    // import sessionGroups
    await this.db.transaction(async (trx) => {
      if (data.sessionGroups && data.sessionGroups.length > 0) {
        const query = await trx.query.sessionGroups.findMany({
          where: and(
            eq(sessionGroups.userId, this.userId),
            inArray(
              sessionGroups.clientId,
              data.sessionGroups.map(({ id }) => id),
            ),
          ),
        });

        sessionGroupResult.skips = query.length;

        const mapArray = await trx
          .insert(sessionGroups)
          .values(
            data.sessionGroups.map(({ id, createdAt, updatedAt, ...res }) => ({
              ...res,
              clientId: id,
              createdAt: new Date(createdAt),
              updatedAt: new Date(updatedAt),
              userId: this.userId,
            })),
          )
          .onConflictDoUpdate({
            set: { updatedAt: new Date() },
            target: [sessionGroups.clientId, sessionGroups.userId],
          })
          .returning({ clientId: sessionGroups.clientId, id: sessionGroups.id })
          .execute();

        sessionGroupResult.added = mapArray.length - query.length;

        sessionGroupIdMap = Object.fromEntries(mapArray.map(({ clientId, id }) => [clientId, id]));
      }

      // import sessions
      if (data.sessions && data.sessions.length > 0) {
        const query = await trx.query.sessions.findMany({
          where: and(
            eq(sessions.userId, this.userId),
            inArray(
              sessions.clientId,
              data.sessions.map(({ id }) => id),
            ),
          ),
        });

        sessionResult.skips = query.length;

        const mapArray = await trx
          .insert(sessions)
          .values(
            data.sessions.map(({ id, createdAt, updatedAt, group, ...res }) => ({
              ...res,
              clientId: id,
              createdAt: new Date(createdAt),
              groupId: group ? sessionGroupIdMap[group] : null,
              updatedAt: new Date(updatedAt),
              userId: this.userId,
            })),
          )
          .onConflictDoUpdate({
            set: { updatedAt: new Date() },
            target: [sessions.clientId, sessions.userId],
          })
          .returning({ clientId: sessions.clientId, id: sessions.id })
          .execute();

        // get the session client-server id map
        sessionIdMap = Object.fromEntries(mapArray.map(({ clientId, id }) => [clientId, id]));

        // update added count
        sessionResult.added = mapArray.length - query.length;

        const shouldInsertSessionAgents = data.sessions
          // filter out existing session, only insert new ones
          .filter((s) => query.every((q) => q.clientId !== s.id));

        // 只有当需要有新的 session 时，才会插入 agent
        if (shouldInsertSessionAgents.length > 0) {
          const agentMapArray = await trx
            .insert(agents)
            .values(
              shouldInsertSessionAgents.map(({ config, meta }) => ({
                ...config,
                ...meta,
                userId: this.userId,
              })),
            )
            .returning({ id: agents.id })
            .execute();

          await trx
            .insert(agentsToSessions)
            .values(
              shouldInsertSessionAgents.map(({ id }, index) => ({
                agentId: agentMapArray[index].id,
                sessionId: sessionIdMap[id],
              })),
            )
            .execute();
        }
      }

      // import topics
      if (data.topics && data.topics.length > 0) {
        const skipQuery = await trx.query.topics.findMany({
          where: and(
            eq(topics.userId, this.userId),
            inArray(
              topics.clientId,
              data.topics.map(({ id }) => id),
            ),
          ),
        });
        topicResult.skips = skipQuery.length;

        const mapArray = await trx
          .insert(topics)
          .values(
            data.topics.map(({ id, createdAt, updatedAt, sessionId, ...res }) => ({
              ...res,
              clientId: id,
              createdAt: new Date(createdAt),
              sessionId: sessionId ? sessionIdMap[sessionId] : null,
              updatedAt: new Date(updatedAt),
              userId: this.userId,
            })),
          )
          .onConflictDoUpdate({
            set: { updatedAt: new Date() },
            target: [topics.clientId, topics.userId],
          })
          .returning({ clientId: topics.clientId, id: topics.id })
          .execute();

        topicIdMap = Object.fromEntries(mapArray.map(({ clientId, id }) => [clientId, id]));

        topicResult.added = mapArray.length - skipQuery.length;
      }

      // import messages
      if (data.messages && data.messages.length > 0) {
        // 1. find skip ones
        console.time('find messages');
        const skipQuery = await trx.query.messages.findMany({
          where: and(
            eq(messages.userId, this.userId),
            inArray(
              messages.clientId,
              data.messages.map(({ id }) => id),
            ),
          ),
        });
        console.timeEnd('find messages');

        messageResult.skips = skipQuery.length;

        // filter out existing messages, only insert new ones
        const shouldInsertMessages = data.messages.filter((s) =>
          skipQuery.every((q) => q.clientId !== s.id),
        );

        // 2. insert messages
        if (shouldInsertMessages.length > 0) {
          const inertValues = shouldInsertMessages.map(
            ({ id, extra, createdAt, updatedAt, sessionId, topicId, ...res }) => ({
              ...res,
              clientId: id,
              createdAt: new Date(createdAt),
              model: extra?.fromModel,
              parentId: null,
              provider: extra?.fromProvider,
              sessionId: sessionId ? sessionIdMap[sessionId] : null,
              topicId: topicId ? topicIdMap[topicId] : null, // 暂时设为 NULL
              updatedAt: new Date(updatedAt),
              userId: this.userId,
            }),
          );

          console.time('insert messages');
          const BATCH_SIZE = 100; // 每批次插入的记录数

          for (let i = 0; i < inertValues.length; i += BATCH_SIZE) {
            const batch = inertValues.slice(i, i + BATCH_SIZE);
            await trx.insert(messages).values(batch).execute();
          }

          console.timeEnd('insert messages');

          const messageIdArray = await trx
            .select({ clientId: messages.clientId, id: messages.id })
            .from(messages)
            .where(
              and(
                eq(messages.userId, this.userId),
                inArray(
                  messages.clientId,
                  data.messages.map(({ id }) => id),
                ),
              ),
            );

          const messageIdMap = Object.fromEntries(
            messageIdArray.map(({ clientId, id }) => [clientId, id]),
          );

          // 3. update parentId for messages
          console.time('execute updates parentId');
          const parentIdUpdates = shouldInsertMessages
            .filter((msg) => msg.parentId) // 只处理有 parentId 的消息
            .map((msg) => {
              if (messageIdMap[msg.parentId as string])
                return sql`WHEN ${messages.clientId} = ${msg.id} THEN ${messageIdMap[msg.parentId as string]} `;

              return undefined;
            })
            .filter(Boolean);

          if (parentIdUpdates.length > 0) {
            const updateQuery = trx
              .update(messages)
              .set({
                parentId: sql`CASE ${sql.join(parentIdUpdates)} END`,
              })
              .where(
                inArray(
                  messages.clientId,
                  data.messages.map((msg) => msg.id),
                ),
              );

            // if needed, you can print the sql and params
            // const SQL = updateQuery.toSQL();
            // console.log('sql:', SQL.sql);
            // console.log('params:', SQL.params);

            await updateQuery.execute();
          }
          console.timeEnd('execute updates parentId');

          // 4. insert message plugins
          const pluginInserts = shouldInsertMessages.filter((msg) => msg.plugin);
          if (pluginInserts.length > 0) {
            await trx
              .insert(messagePlugins)
              .values(
                pluginInserts.map((msg) => ({
                  apiName: msg.plugin?.apiName,
                  arguments: msg.plugin?.arguments,
                  id: messageIdMap[msg.id],
                  identifier: msg.plugin?.identifier,
                  state: msg.pluginState,
                  toolCallId: msg.tool_call_id,
                  type: msg.plugin?.type,
                })),
              )
              .execute();
          }

          // 5. insert message translate
          const translateInserts = shouldInsertMessages.filter((msg) => msg.extra?.translate);
          if (translateInserts.length > 0) {
            await trx
              .insert(messageTranslates)
              .values(
                translateInserts.map((msg) => ({
                  id: messageIdMap[msg.id],
                  ...msg.extra?.translate,
                })),
              )
              .execute();
          }

          // TODO: 未来需要处理 TTS 和图片的插入 （目前存在 file 的部分，不方便处理）
        }

        messageResult.added = shouldInsertMessages.length;
      }
    });

    return {
      messages: messageResult,
      sessionGroups: sessionGroupResult,
      sessions: sessionResult,
      topics: topicResult,
    };
  };
}
