import { Column, count, sql } from 'drizzle-orm';
import { and, asc, desc, eq, inArray, like, not, or } from 'drizzle-orm/expressions';

import { appEnv } from '@/config/app';
import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeChatDatabase } from '@/database/type';
import { idGenerator } from '@/database/utils/idGenerator';
import { parseAgentConfig } from '@/server/globalConfig/parseDefaultAgent';
import { ChatSessionList, LobeAgentSession } from '@/types/session';
import { merge } from '@/utils/merge';

import {
  AgentItem,
  NewAgent,
  NewSession,
  SessionItem,
  agents,
  agentsToSessions,
  sessionGroups,
  sessions,
} from '../../schemas';

export class SessionModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }
  // **************** Query *************** //

  query = async ({ current = 0, pageSize = 9999 } = {}) => {
    const offset = current * pageSize;

    return this.db.query.sessions.findMany({
      limit: pageSize,
      offset,
      orderBy: [desc(sessions.updatedAt)],
      where: and(eq(sessions.userId, this.userId), not(eq(sessions.slug, INBOX_SESSION_ID))),
      with: { agentsToSessions: { columns: {}, with: { agent: true } }, group: true },
    });
  };

  queryWithGroups = async (): Promise<ChatSessionList> => {
    // 查询所有会话
    const result = await this.query();

    const groups = await this.db.query.sessionGroups.findMany({
      orderBy: [asc(sessionGroups.sort), desc(sessionGroups.createdAt)],
      where: eq(sessions.userId, this.userId),
    });

    return {
      sessionGroups: groups as unknown as ChatSessionList['sessionGroups'],
      sessions: result.map((item) => this.mapSessionItem(item as any)),
    };
  };

  queryByKeyword = async (keyword: string) => {
    if (!keyword) return [];

    const keywordLowerCase = keyword.toLowerCase();

    const data = await this.findSessionsByKeywords({ keyword: keywordLowerCase });

    return data.map((item) => this.mapSessionItem(item as any));
  };

  findByIdOrSlug = async (
    idOrSlug: string,
  ): Promise<(SessionItem & { agent: AgentItem }) | undefined> => {
    const result = await this.db.query.sessions.findFirst({
      where: and(
        or(eq(sessions.id, idOrSlug), eq(sessions.slug, idOrSlug)),
        eq(sessions.userId, this.userId),
      ),
      with: { agentsToSessions: { columns: {}, with: { agent: true } }, group: true },
    });

    if (!result) return;

    return { ...result, agent: (result?.agentsToSessions?.[0] as any)?.agent } as any;
  };

  count = async (): Promise<number> => {
    const result = await this.db
      .select({
        count: count(sessions.id),
      })
      .from(sessions)
      .where(eq(sessions.userId, this.userId));

    return result[0].count;
  };

  hasMoreThanN = async (n: number): Promise<boolean> => {
    const result = await this.db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.userId, this.userId))
      .limit(n + 1);

    return result.length > n;
  };

  // **************** Create *************** //

  create = async ({
    id = idGenerator('sessions'),
    type = 'agent',
    session = {},
    config = {},
    slug,
  }: {
    config?: Partial<NewAgent>;
    id?: string;
    session?: Partial<NewSession>;
    slug?: string;
    type: 'agent' | 'group';
  }): Promise<SessionItem> => {
    return this.db.transaction(async (trx) => {
      const newAgents = await trx
        .insert(agents)
        .values({
          ...config,
          createdAt: new Date(),
          id: idGenerator('agents'),
          updatedAt: new Date(),
          userId: this.userId,
        })
        .returning();

      const result = await trx
        .insert(sessions)
        .values({
          ...session,
          createdAt: new Date(),
          id,
          slug,
          type,
          updatedAt: new Date(),
          userId: this.userId,
        })
        .returning();

      await trx.insert(agentsToSessions).values({
        agentId: newAgents[0].id,
        sessionId: id,
      });

      return result[0];
    });
  };

  createInbox = async () => {
    const item = await this.db.query.sessions.findFirst({
      where: and(eq(sessions.userId, this.userId), eq(sessions.slug, INBOX_SESSION_ID)),
    });
    if (item) return;

    const serverAgentConfig = parseAgentConfig(appEnv.DEFAULT_AGENT_CONFIG) || {};

    return await this.create({
      config: merge(DEFAULT_AGENT_CONFIG, serverAgentConfig),
      slug: INBOX_SESSION_ID,
      type: 'agent',
    });
  };

  batchCreate = async (newSessions: NewSession[]) => {
    const sessionsToInsert = newSessions.map((s) => {
      return {
        ...s,
        id: this.genId(),
        userId: this.userId,
      };
    });

    return this.db.insert(sessions).values(sessionsToInsert);
  };

  duplicate = async (id: string, newTitle?: string) => {
    const result = await this.findByIdOrSlug(id);

    if (!result) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,unused-imports/no-unused-vars
    const { agent, clientId, ...session } = result;
    const sessionId = this.genId();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, slug: __, ...config } = agent;

    return this.create({
      config: config,
      id: sessionId,
      session: {
        ...session,
        title: newTitle || session.title,
      },
      type: 'agent',
    });
  };

  // **************** Delete *************** //

  /**
   * Delete a session, also delete all messages and topics associated with it.
   */
  delete = async (id: string) => {
    return this.db
      .delete(sessions)
      .where(and(eq(sessions.id, id), eq(sessions.userId, this.userId)));
  };

  /**
   * Batch delete sessions, also delete all messages and topics associated with them.
   */
  batchDelete = async (ids: string[]) => {
    return this.db
      .delete(sessions)
      .where(and(inArray(sessions.id, ids), eq(sessions.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(sessions).where(eq(sessions.userId, this.userId));
  };
  // **************** Update *************** //

  update = async (id: string, data: Partial<SessionItem>) => {
    return this.db
      .update(sessions)
      .set(data)
      .where(and(eq(sessions.id, id), eq(sessions.userId, this.userId)))
      .returning();
  };

  updateConfig = async (id: string, data: Partial<AgentItem>) => {
    if (Object.keys(data).length === 0) return;

    return this.db
      .update(agents)
      .set(data)
      .where(and(eq(agents.id, id), eq(agents.userId, this.userId)));
  };

  // **************** Helper *************** //

  private genId = () => idGenerator('sessions');

  private mapSessionItem = ({
    agentsToSessions,
    title,
    backgroundColor,
    description,
    avatar,
    groupId,
    ...res
  }: SessionItem & { agentsToSessions?: { agent: AgentItem }[] }): LobeAgentSession => {
    // TODO: 未来这里需要更好的实现方案，目前只取第一个
    const agent = agentsToSessions?.[0]?.agent;
    return {
      ...res,
      group: groupId,
      meta: {
        avatar: agent?.avatar ?? avatar ?? undefined,
        backgroundColor: agent?.backgroundColor ?? backgroundColor ?? undefined,
        description: agent?.description ?? description ?? undefined,
        tags: agent?.tags ?? undefined,
        title: agent?.title ?? title ?? undefined,
      },
      model: agent?.model,
    } as any;
  };

  findSessionsByKeywords = async (params: {
    current?: number;
    keyword: string;
    pageSize?: number;
  }) => {
    const { keyword, pageSize = 9999, current = 0 } = params;
    const offset = current * pageSize;
    const results = await this.db.query.agents.findMany({
      limit: pageSize,
      offset,
      orderBy: [desc(agents.updatedAt)],
      where: and(
        eq(agents.userId, this.userId),
        or(
          like(sql`lower(${agents.title})` as unknown as Column, `%${keyword.toLowerCase()}%`),
          like(
            sql`lower(${agents.description})` as unknown as Column,
            `%${keyword.toLowerCase()}%`,
          ),
        ),
      ),
      with: { agentsToSessions: { columns: {}, with: { session: true } } },
    });
    try {
      // @ts-expect-error
      return results.map((item) => item.agentsToSessions[0].session);
    } catch (e) {
      console.error('findSessionsByKeywords error:', e);
    }
    return [];
  };
}
