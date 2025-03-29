import { Column, count, sql } from 'drizzle-orm';
import { and, asc, desc, eq, gt, inArray, isNull, like, not, or } from 'drizzle-orm/expressions';
import { DeepPartial } from 'utility-types';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeChatDatabase } from '@/database/type';
import {
  genEndDateWhere,
  genRangeWhere,
  genStartDateWhere,
  genWhere,
} from '@/database/utils/genWhere';
import { idGenerator } from '@/database/utils/idGenerator';
import { LobeAgentConfig } from '@/types/agent';
import { ChatSessionList, LobeAgentSession, SessionRankItem } from '@/types/session';
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
  topics,
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

  count = async (params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number> => {
    const result = await this.db
      .select({
        count: count(sessions.id),
      })
      .from(sessions)
      .where(
        genWhere([
          eq(sessions.userId, this.userId),
          params?.range
            ? genRangeWhere(params.range, sessions.createdAt, (date) => date.toDate())
            : undefined,
          params?.endDate
            ? genEndDateWhere(params.endDate, sessions.createdAt, (date) => date.toDate())
            : undefined,
          params?.startDate
            ? genStartDateWhere(params.startDate, sessions.createdAt, (date) => date.toDate())
            : undefined,
        ]),
      );

    return result[0].count;
  };

  _rank = async (limit: number = 10): Promise<SessionRankItem[]> => {
    return this.db
      .select({
        avatar: agents.avatar,
        backgroundColor: agents.backgroundColor,
        count: count(topics.id).as('count'),
        id: sessions.id,
        title: agents.title,
      })
      .from(sessions)
      .where(and(eq(sessions.userId, this.userId)))
      .leftJoin(topics, eq(sessions.id, topics.sessionId))
      .leftJoin(agentsToSessions, eq(sessions.id, agentsToSessions.sessionId))
      .leftJoin(agents, eq(agentsToSessions.agentId, agents.id))
      .groupBy(sessions.id, agentsToSessions.agentId, agents.id)
      .having(({ count }) => gt(count, 0))
      .orderBy(desc(sql`count`))
      .limit(limit);
  };

  // TODO: 未来将 Inbox id 入库后可以直接使用 _rank 方法
  rank = async (limit: number = 10): Promise<SessionRankItem[]> => {
    const inboxResult = await this.db
      .select({
        count: count(topics.id).as('count'),
      })
      .from(topics)
      .where(and(eq(topics.userId, this.userId), isNull(topics.sessionId)));

    const inboxCount = inboxResult[0].count;

    if (!inboxCount || inboxCount === 0) return this._rank(limit);

    const result = await this._rank(limit ? limit - 1 : undefined);

    return [
      {
        avatar: DEFAULT_INBOX_AVATAR,
        backgroundColor: null,
        count: inboxCount,
        id: INBOX_SESSION_ID,
        title: 'inbox.title',
      },
      ...result,
    ].sort((a, b) => b.count - a.count);
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
        userId: this.userId,
      });

      return result[0];
    });
  };

  createInbox = async (defaultAgentConfig: DeepPartial<LobeAgentConfig>) => {
    const item = await this.db.query.sessions.findFirst({
      where: and(eq(sessions.userId, this.userId), eq(sessions.slug, INBOX_SESSION_ID)),
    });

    if (item) return;

    return await this.create({
      config: merge(DEFAULT_AGENT_CONFIG, defaultAgentConfig),
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
   * Delete a session and its associated agent data if no longer referenced.
   */
  delete = async (id: string) => {
    return this.db.transaction(async (trx) => {
      // First get the agent IDs associated with this session
      const links = await trx
        .select({ agentId: agentsToSessions.agentId })
        .from(agentsToSessions)
        .where(and(eq(agentsToSessions.sessionId, id), eq(agentsToSessions.userId, this.userId)));

      const agentIds = links.map((link) => link.agentId);

      // Delete links in agentsToSessions
      await trx
        .delete(agentsToSessions)
        .where(and(eq(agentsToSessions.sessionId, id), eq(agentsToSessions.userId, this.userId)));

      // Delete the session
      const result = await trx
        .delete(sessions)
        .where(and(eq(sessions.id, id), eq(sessions.userId, this.userId)));

      // Delete orphaned agents
      await this.clearOrphanAgent(agentIds, trx);

      return result;
    });
  };

  /**
   * Batch delete sessions and their associated agent data if no longer referenced.
   */
  batchDelete = async (ids: string[]) => {
    if (ids.length === 0) return { count: 0 };

    return this.db.transaction(async (trx) => {
      // Get agent IDs associated with these sessions
      const links = await trx
        .select({ agentId: agentsToSessions.agentId })
        .from(agentsToSessions)
        .where(
          and(inArray(agentsToSessions.sessionId, ids), eq(agentsToSessions.userId, this.userId)),
        );

      const agentIds = [...new Set(links.map((link) => link.agentId))];

      // Delete links in agentsToSessions
      await trx
        .delete(agentsToSessions)
        .where(
          and(inArray(agentsToSessions.sessionId, ids), eq(agentsToSessions.userId, this.userId)),
        );

      // Delete the sessions
      const result = await trx
        .delete(sessions)
        .where(and(inArray(sessions.id, ids), eq(sessions.userId, this.userId)));

      // Delete orphaned agents
      await this.clearOrphanAgent(agentIds, trx);

      return result;
    });
  };

  /**
   * Delete all sessions and their associated agent data for this user.
   */
  deleteAll = async () => {
    return this.db.transaction(async (trx) => {
      // Delete all agentsToSessions for this user
      await trx.delete(agentsToSessions).where(eq(agentsToSessions.userId, this.userId));

      // Delete all agents that were only used by this user's sessions
      await trx.delete(agents).where(eq(agents.userId, this.userId));

      // Delete all sessions for this user
      return trx.delete(sessions).where(eq(sessions.userId, this.userId));
    });
  };

  clearOrphanAgent = async (agentIds: string[], trx: any) => {
    // Delete orphaned agents (those not linked to any other sessions)
    for (const agentId of agentIds) {
      const remaining = await trx
        .select()
        .from(agentsToSessions)
        .where(eq(agentsToSessions.agentId, agentId))
        .limit(1);

      if (remaining.length === 0) {
        await trx.delete(agents).where(and(eq(agents.id, agentId), eq(agents.userId, this.userId)));
      }
    }
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
