import { DEFAULT_AGENT_CONFIG } from '@lobechat/const';
import { LobeChatDatabase } from '@lobechat/database';
import { cleanObject } from '@lobechat/utils';
import type { PartialDeep } from 'type-fest';

import { AgentModel } from '@/database/models/agent';
import { SessionModel } from '@/database/models/session';
import { getServerDefaultAgentConfig } from '@/server/globalConfig';
import { AgentItem, LobeAgentConfig } from '@/types/agent';
import { merge } from '@/utils/merge';

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
   *
   * The returned agent config is merged with:
   * 1. DEFAULT_AGENT_CONFIG (hardcoded defaults)
   * 2. Server's globalDefaultAgentConfig (from environment variable DEFAULT_AGENT_CONFIG)
   * 3. The actual agent config from database
   *
   * This ensures the frontend always receives a complete config with model/provider.
   */
  async getBuiltinAgent(slug: string) {
    const agent = await this.agentModel.getBuiltinAgent(slug);

    return this.mergeDefaultConfig(agent);
  }

  /**
   * Get agent config by ID with default config merged.
   *
   * The returned agent config is merged with:
   * 1. DEFAULT_AGENT_CONFIG (hardcoded defaults)
   * 2. Server's globalDefaultAgentConfig (from environment variable DEFAULT_AGENT_CONFIG)
   * 3. The actual agent config from database
   *
   * This ensures the frontend always receives a complete config with model/provider.
   */
  async getAgentConfigById(agentId: string) {
    const agent = await this.agentModel.getAgentConfigById(agentId);

    return this.mergeDefaultConfig(agent);
  }

  /**
   * Merge default config with agent config.
   * Returns null if agent is null/undefined.
   */
  private mergeDefaultConfig(agent: any): LobeAgentConfig | null {
    if (!agent) return null;

    // Merge configs: DEFAULT_AGENT_CONFIG -> serverDefaultAgentConfig -> agent
    // This ensures model/provider are always present
    const serverDefaultAgentConfig = merge(DEFAULT_AGENT_CONFIG, getServerDefaultAgentConfig());

    return merge(serverDefaultAgentConfig, cleanObject(agent));
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

    // 2. Query and return updated data (with default config merged)
    const agent = await this.getAgentConfigById(agentId);

    return { agent: agent as any, success: true };
  }
}
