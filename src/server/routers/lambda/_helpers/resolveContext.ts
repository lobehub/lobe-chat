import { and, eq } from 'drizzle-orm';

import { agentsToSessions } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { ConversationContextInput } from '../_schema/context';

export interface ResolvedContext {
  groupId: string | null;
  sessionId: string | null;
  threadId: string | null;
  topicId: string | null;
}

/**
 * 解析会话上下文
 *
 * 将 agentId 解析为 sessionId（如果提供了 agentId）
 * 优先级：agentId > sessionId
 *
 * @param input - 输入的上下文参数
 * @param db - 数据库实例
 * @param userId - 用户 ID
 * @returns 解析后的上下文，sessionId 已从 agentId 解析
 */
export const resolveContext = async (
  input: ConversationContextInput,
  db: LobeChatDatabase,
  userId: string,
): Promise<ResolvedContext> => {
  let resolvedSessionId: string | null = input.sessionId ?? null;

  // 如果提供了 agentId，优先从 agentsToSessions 表查找对应的 sessionId
  if (input.agentId) {
    const [relation] = await db
      .select({ sessionId: agentsToSessions.sessionId })
      .from(agentsToSessions)
      .where(and(eq(agentsToSessions.agentId, input.agentId), eq(agentsToSessions.userId, userId)))
      .limit(1);

    if (relation) {
      resolvedSessionId = relation.sessionId;
    }
  }

  return {
    groupId: input.groupId ?? null,
    sessionId: resolvedSessionId,
    threadId: input.threadId ?? null,
    topicId: input.topicId ?? null,
  };
};

/**
 * 反向解析：从 sessionId 获取 agentId
 *
 * 用于 Topic Router 等需要 agentId 进行查询的场景
 *
 * @param sessionId - session ID
 * @param db - 数据库实例
 * @param userId - 用户 ID
 * @returns agentId 或 undefined
 */
export const resolveAgentIdFromSession = async (
  sessionId: string,
  db: LobeChatDatabase,
  userId: string,
): Promise<string | undefined> => {
  const [relation] = await db
    .select({ agentId: agentsToSessions.agentId })
    .from(agentsToSessions)
    .where(and(eq(agentsToSessions.sessionId, sessionId), eq(agentsToSessions.userId, userId)))
    .limit(1);

  return relation?.agentId;
};
