import { DEFAULT_AGENT_CONFIG, DEFAULT_CHAT_GROUP_CHAT_CONFIG } from '@lobechat/const';
import { LobeChatDatabase } from '@lobechat/database';
import { LobeAgentConfig } from '@lobechat/types';
import { cleanObject, merge } from '@lobechat/utils';
import type { PartialDeep } from 'type-fest';

import { ChatGroupModel } from '@/database/models/chatGroup';
import { AgentGroupRepository } from '@/database/repositories/agentGroup';
import { UserSettingsItem } from '@/database/schemas';
import { ChatGroupConfig } from '@/database/types/chatGroup';
import { getServerDefaultAgentConfig } from '@/server/globalConfig';

/**
 * ChatGroup Service
 *
 * Encapsulates "mutation + query" logic for chat group operations.
 * Handles agent config merging for group members.
 */
export class ChatGroupService {
  private readonly chatGroupModel: ChatGroupModel;
  private readonly agentGroupRepo: AgentGroupRepository;

  constructor(db: LobeChatDatabase, userId: string) {
    this.chatGroupModel = new ChatGroupModel(db, userId);
    this.agentGroupRepo = new AgentGroupRepository(db, userId);
  }

  /**
   * Get group detail by ID.
   */
  getGroupDetail(groupId: string) {
    return this.agentGroupRepo.findByIdWithAgents(groupId);
  }

  /**
   * Get all groups with member details.
   */
  getGroups() {
    return this.chatGroupModel.queryWithMemberDetails();
  }

  /**
   * Normalize ChatGroupConfig with defaults.
   * Merges DEFAULT_CHAT_GROUP_CHAT_CONFIG with the provided config.
   */
  normalizeGroupConfig(config?: ChatGroupConfig | null): ChatGroupConfig | undefined {
    return config
      ? {
          ...DEFAULT_CHAT_GROUP_CHAT_CONFIG,
          ...config,
        }
      : undefined;
  }

  /**
   * Merge agents with default configs.
   *
   * Merge order (later values override earlier):
   * 1. DEFAULT_AGENT_CONFIG - hardcoded defaults
   * 2. serverDefaultAgentConfig - from environment variable
   * 3. userDefaultAgentConfig - from user settings
   * 4. agent - actual agent config from database
   *
   * @param userSettings - User settings for extracting default agent config
   * @param agents - Array of agents to merge
   * @returns Merged agents array
   */
  mergeAgentsDefaultConfig<T extends Record<string, any>>(
    userSettings: UserSettingsItem | null | undefined,
    agents: T[],
  ) {
    const userDefaultAgentConfig =
      (userSettings?.defaultAgent as { config?: PartialDeep<LobeAgentConfig> })?.config || {};

    const serverDefaultAgentConfig = getServerDefaultAgentConfig();
    const baseConfig = merge(DEFAULT_AGENT_CONFIG, serverDefaultAgentConfig);
    const withUserConfig = merge(baseConfig, userDefaultAgentConfig);

    return agents.map((agent) => merge(withUserConfig, cleanObject(agent)) as T);
  }
}
