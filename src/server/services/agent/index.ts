import { LobeChatDatabase } from '@lobechat/database';
import type { PartialDeep } from 'type-fest';

import { AgentModel } from '@/database/models/agent';
import { SessionModel } from '@/database/models/session';
import { getServerDefaultAgentConfig } from '@/server/globalConfig';
import { AgentItem } from '@/types/agent';

import { UpdateAgentResult } from './type';

/**
 * Agent Service
 *
 * Encapsulates "mutation + query" logic for agent operations.
 * After performing update operations, returns the updated agent data.
 */
export class AgentService {
  private readonly userId: string;
  private readonly db: LobeChatDatabase;
  private readonly agentModel: AgentModel;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.agentModel = new AgentModel(db, userId);
  }

  async createInbox() {
    const sessionModel = new SessionModel(this.db, this.userId);
    const defaultAgentConfig = getServerDefaultAgentConfig();
    await sessionModel.createInbox(defaultAgentConfig);
  }

  /**
   * Get a builtin agent by slug, creating it if it doesn't exist.
   * This is a generic interface for all builtin agents (page-copilot, inbox, etc.)
   */
  async getBuiltinAgent(slug: string) {
    return this.agentModel.getBuiltinAgent(slug);
  }

  /**
   * Update agent config and return the updated data
   * Pattern: update + query
   *
   * This method combines config update and querying into a single operation,
   * reducing the need for separate refresh calls and improving performance.
   */
  async updateAgentConfig(
    agentId: string,
    value: PartialDeep<AgentItem>,
  ): Promise<UpdateAgentResult> {
    // 1. Execute update
    await this.agentModel.updateConfig(agentId, value);

    // 2. Query and return updated data
    const agent = await this.agentModel.getAgentConfigById(agentId);

    return { agent: agent as any, success: true };
  }
}
