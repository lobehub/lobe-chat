import { Column, asc, count, inArray, like, sql } from 'drizzle-orm';
import { and, desc, eq, isNull, not, or } from 'drizzle-orm/expressions';

import { appEnv } from '@/config/app';
import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { serverDB } from '@/database/server/core/db';
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
} from '../schemas/lobechat';
import { idGenerator } from '../utils/idGenerator';

export class SessionModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
  // **************** Query *************** //

  async query({ current = 0, pageSize = 9999 } = {}) {
    const offset = current * pageSize;

    return serverDB.query.sessions.findMany({
      limit: pageSize,
      offset,
      orderBy: [desc(sessions.updatedAt)],
      where: and(eq(sessions.userId, this.userId), not(eq(sessions.slug, INBOX_SESSION_ID))),
      with: { agentsToSessions: { columns: {}, with: { agent: true } }, group: true },
    });
  }

  async queryWithGroups(): Promise<ChatSessionList> {
    // 查询所有会话
    const result = await this.query();

    const groups = await serverDB.query.sessionGroups.findMany({
      orderBy: [asc(sessionGroups.sort), desc(sessionGroups.createdAt)],
      where: eq(sessions.userId, this.userId),
    });

    return {
      sessionGroups: groups as unknown as ChatSessionList['sessionGroups'],
      sessions: result.map((item) => this.mapSessionItem(item as any)),
    };
  }

  async queryByKeyword(keyword: string) {
    if (!keyword) return [];

    const keywordLowerCase = keyword.toLowerCase();

    const data = await this.findSessions({ keyword: keywordLowerCase });

    return data.map((item) => this.mapSessionItem(item as any));
  }

  async findByIdOrSlug(
    idOrSlug: string,
  ): Promise<(SessionItem & { agent: AgentItem }) | undefined> {
    const result = await serverDB.query.sessions.findFirst({
      where: and(
        or(eq(sessions.id, idOrSlug), eq(sessions.slug, idOrSlug)),
        eq(sessions.userId, this.userId),
      ),
      with: { agentsToSessions: { columns: {}, with: { agent: true } }, group: true },
    });

    if (!result) return;

    return { ...result, agent: (result?.agentsToSessions?.[0] as any)?.agent } as any;
  }

  async count() {
    const result = await serverDB
      .select({
        count: count(),
      })
      .from(sessions)
      .where(eq(sessions.userId, this.userId))
      .execute();

    return result[0].count;
  }

  // **************** Create *************** //

  async create({
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
  }): Promise<SessionItem> {
    return serverDB.transaction(async (trx) => {
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
  }

  async createInbox() {
    const serverAgentConfig = parseAgentConfig(appEnv.DEFAULT_AGENT_CONFIG) || {};

    return await this.create({
      config: merge(DEFAULT_AGENT_CONFIG, serverAgentConfig),
      slug: INBOX_SESSION_ID,
      type: 'agent',
    });
  }

  async batchCreate(newSessions: NewSession[]) {
    const sessionsToInsert = newSessions.map((s) => {
      return {
        ...s,
        id: this.genId(),
        userId: this.userId,
      };
    });

    return serverDB.insert(sessions).values(sessionsToInsert);
  }

  async duplicate(id: string, newTitle?: string) {
    const result = await this.findByIdOrSlug(id);

    if (!result) return;

    const { agent, ...session } = result;
    const sessionId = this.genId();

    return this.create({
      config: agent,
      id: sessionId,
      session: {
        ...session,
        title: newTitle || session.title,
      },
      type: 'agent',
    });
  }

  // **************** Delete *************** //

  /**
   * Delete a session, also delete all messages and topics associated with it.
   */
  async delete(id: string) {
    return serverDB
      .delete(sessions)
      .where(and(eq(sessions.id, id), eq(sessions.userId, this.userId)));
  }

  /**
   * Batch delete sessions, also delete all messages and topics associated with them.
   */
  async batchDelete(ids: string[]) {
    return serverDB
      .delete(sessions)
      .where(and(inArray(sessions.id, ids), eq(sessions.userId, this.userId)));
  }

  async deleteAll() {
    return serverDB.delete(sessions).where(eq(sessions.userId, this.userId));
  }
  // **************** Update *************** //

  async update(id: string, data: Partial<SessionItem>) {
    return serverDB
      .update(sessions)
      .set(data)
      .where(and(eq(sessions.id, id), eq(sessions.userId, this.userId)))
      .returning();
  }

  async updateConfig(id: string, data: Partial<AgentItem>) {
    return serverDB
      .update(agents)
      .set(data)
      .where(and(eq(agents.id, id), eq(agents.userId, this.userId)));
  }

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
        title: agent?.title ?? title ?? undefined,
      },
      model: agent?.model,
    } as any;
  };

  async findSessions(params: {
    current?: number;
    group?: string;
    keyword?: string;
    pageSize?: number;
    pinned?: boolean;
  }) {
    const { pinned, keyword, group, pageSize = 9999, current = 0 } = params;

    const offset = current * pageSize;
    return serverDB.query.sessions.findMany({
      limit: pageSize,
      offset,
      orderBy: [desc(sessions.updatedAt)],
      where: and(
        eq(sessions.userId, this.userId),
        pinned !== undefined ? eq(sessions.pinned, pinned) : eq(sessions.userId, this.userId),
        keyword
          ? or(
              like(
                sql`lower(${sessions.title})` as unknown as Column,
                `%${keyword.toLowerCase()}%`,
              ),
              like(
                sql`lower(${sessions.description})` as unknown as Column,
                `%${keyword.toLowerCase()}%`,
              ),
            )
          : eq(sessions.userId, this.userId),
        group ? eq(sessions.groupId, group) : isNull(sessions.groupId),
      ),

      with: { agentsToSessions: { columns: {}, with: { agent: true } }, group: true },
    });
  }
}
