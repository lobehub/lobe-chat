import { and, desc, eq, inArray } from 'drizzle-orm/expressions';

import {
  agents,
  agentsFiles,
  agentsKnowledgeBases,
  agentsToSessions,
  files,
  knowledgeBases,
} from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

export class AgentModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  async getAgentConfigById(id: string) {
    const agent = await this.db.query.agents.findFirst({ where: eq(agents.id, id) });

    const knowledge = await this.getAgentAssignedKnowledge(id);

    return { ...agent, ...knowledge };
  }

  async getAgentAssignedKnowledge(id: string) {
    const knowledgeBaseResult = await this.db
      .select({ enabled: agentsKnowledgeBases.enabled, knowledgeBases })
      .from(agentsKnowledgeBases)
      .where(eq(agentsKnowledgeBases.agentId, id))
      .orderBy(desc(agentsKnowledgeBases.createdAt))
      .leftJoin(knowledgeBases, eq(knowledgeBases.id, agentsKnowledgeBases.knowledgeBaseId));

    const fileResult = await this.db
      .select({ enabled: agentsFiles.enabled, files })
      .from(agentsFiles)
      .where(eq(agentsFiles.agentId, id))
      .orderBy(desc(agentsFiles.createdAt))
      .leftJoin(files, eq(files.id, agentsFiles.fileId));

    return {
      files: fileResult.map((item) => ({
        ...item.files,
        enabled: item.enabled,
      })),
      knowledgeBases: knowledgeBaseResult.map((item) => ({
        ...item.knowledgeBases,
        enabled: item.enabled,
      })),
    };
  }

  /**
   * Find agent by session id
   */
  async findBySessionId(sessionId: string) {
    const item = await this.db.query.agentsToSessions.findFirst({
      where: eq(agentsToSessions.sessionId, sessionId),
    });
    if (!item) return;

    const agentId = item.agentId;

    return this.getAgentConfigById(agentId);
  }

  createAgentKnowledgeBase = async (
    agentId: string,
    knowledgeBaseId: string,
    enabled: boolean = true,
  ) => {
    return this.db
      .insert(agentsKnowledgeBases)
      .values({
        agentId,
        enabled,
        knowledgeBaseId,
        userId: this.userId,
      })
      .execute();
  };

  deleteAgentKnowledgeBase = async (agentId: string, knowledgeBaseId: string) => {
    return this.db
      .delete(agentsKnowledgeBases)
      .where(
        and(
          eq(agentsKnowledgeBases.agentId, agentId),
          eq(agentsKnowledgeBases.knowledgeBaseId, knowledgeBaseId),
          eq(agentsKnowledgeBases.userId, this.userId),
        ),
      )
      .execute();
  };

  toggleKnowledgeBase = async (agentId: string, knowledgeBaseId: string, enabled?: boolean) => {
    return this.db
      .update(agentsKnowledgeBases)
      .set({ enabled })
      .where(
        and(
          eq(agentsKnowledgeBases.agentId, agentId),
          eq(agentsKnowledgeBases.knowledgeBaseId, knowledgeBaseId),
          eq(agentsKnowledgeBases.userId, this.userId),
        ),
      )
      .execute();
  };

  createAgentFiles = async (agentId: string, fileIds: string[], enabled: boolean = true) => {
    // Exclude the fileIds that already exist in agentsFiles, and then insert them
    const existingFiles = await this.db
      .select({ id: agentsFiles.fileId })
      .from(agentsFiles)
      .where(
        and(
          eq(agentsFiles.agentId, agentId),
          eq(agentsFiles.userId, this.userId),
          inArray(agentsFiles.fileId, fileIds),
        ),
      );

    const existingFilesIds = new Set(existingFiles.map((item) => item.id));

    const needToInsertFileIds = fileIds.filter((fileId) => !existingFilesIds.has(fileId));

    if (needToInsertFileIds.length === 0) return;

    return this.db
      .insert(agentsFiles)
      .values(
        needToInsertFileIds.map((fileId) => ({ agentId, enabled, fileId, userId: this.userId })),
      )
      .execute();
  };

  deleteAgentFile = async (agentId: string, fileId: string) => {
    return this.db
      .delete(agentsFiles)
      .where(
        and(
          eq(agentsFiles.agentId, agentId),
          eq(agentsFiles.fileId, fileId),
          eq(agentsFiles.userId, this.userId),
        ),
      )
      .execute();
  };

  toggleFile = async (agentId: string, fileId: string, enabled?: boolean) => {
    return this.db
      .update(agentsFiles)
      .set({ enabled })
      .where(
        and(
          eq(agentsFiles.agentId, agentId),
          eq(agentsFiles.fileId, fileId),
          eq(agentsFiles.userId, this.userId),
        ),
      )
      .execute();
  };
}
