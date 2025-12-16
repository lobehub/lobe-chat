import { AgentBuilderIdentifier } from '@lobechat/builtin-tool-agent-builder';
import { isDesktop } from '@lobechat/const';
import { AgentBuilderContext, AgentGroupConfig, MessagesEngine } from '@lobechat/context-engine';
import { historySummaryPrompt } from '@lobechat/prompts';
import { OpenAIChatMessage, UIChatMessage } from '@lobechat/types';
import { VARIABLE_GENERATORS } from '@lobechat/utils/client';
import debug from 'debug';

import { isCanUseFC } from '@/helpers/isCanUseFC';
import { getAgentStoreState } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { getChatGroupStoreState } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';
import { getToolStoreState } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

import { isCanUseVideo, isCanUseVision } from '../helper';
import type { UserMemoriesResult } from './memoryManager';

const log = debug('context-engine:contextEngineering');

interface ContextEngineeringContext {
  /** Agent Builder context for injecting current agent info */
  agentBuilderContext?: AgentBuilderContext;
  /** The agent ID that will respond (for group context injection) */
  agentId?: string;
  enableHistoryCount?: boolean;
  /** Group ID for multi-agent scenarios */
  groupId?: string;
  historyCount?: number;
  historySummary?: string;
  inputTemplate?: string;
  messages: UIChatMessage[];
  model: string;
  provider: string;
  sessionId?: string;
  systemRole?: string;
  tools?: string[];
  userMemories?: UserMemoriesResult;
}

// REVIEW：可能这里可以约束一下 identity，preference，exp 的 重新排序或者裁切过的上下文进来而不是全部丢进来
export const contextEngineering = async ({
  messages = [],
  tools,
  model,
  provider,
  systemRole,
  inputTemplate,
  userMemories,
  enableHistoryCount,
  historyCount,
  historySummary,
  agentBuilderContext,
  agentId,
  groupId,
}: ContextEngineeringContext): Promise<OpenAIChatMessage[]> => {
  log('tools: %o', tools);

  // Check if Agent Builder tool is enabled
  const isAgentBuilderEnabled = tools?.includes(AgentBuilderIdentifier) ?? false;

  log('isAgentBuilderEnabled: %s', isAgentBuilderEnabled);

  // Build agent group configuration if groupId is provided
  let agentGroup: AgentGroupConfig | undefined;
  if (groupId) {
    const groupStoreState = getChatGroupStoreState();
    const groupDetail = agentGroupSelectors.getGroupById(groupId)(groupStoreState);

    if (groupDetail?.agents && groupDetail.agents.length > 0) {
      const agentMap: AgentGroupConfig['agentMap'] = {};
      const members: AgentGroupConfig['members'] = [];

      // Find the responding agent to get its name and role
      let currentAgentName: string | undefined;
      let currentAgentRole: 'supervisor' | 'participant' | undefined;

      for (const agent of groupDetail.agents) {
        const role = agent.isSupervisor ? 'supervisor' : 'participant';
        const name = agent.title || 'Untitled Agent';

        agentMap[agent.id] = { name, role };
        members.push({ id: agent.id, name, role });

        // Capture responding agent info
        if (agentId && agent.id === agentId) {
          currentAgentName = name;
          currentAgentRole = role;
        }
      }

      agentGroup = {
        agentMap,
        currentAgentId: agentId,
        currentAgentName,
        currentAgentRole,
        groupTitle: groupDetail.title || undefined,
        members,
        systemPrompt: groupDetail.config?.systemPrompt || undefined,
      };
      log('agentGroup built: %o', agentGroup);
    }
  }

  // Get enabled agent files with content and knowledge bases from agent store
  const agentStoreState = getAgentStoreState();
  const agentFiles = agentSelectors.currentAgentFiles(agentStoreState);
  const agentKnowledgeBases = agentSelectors.currentAgentKnowledgeBases(agentStoreState);

  const fileContents = agentFiles
    .filter((file) => file.enabled && file.content)
    .map((file) => ({ content: file.content!, fileId: file.id, filename: file.name }));

  const knowledgeBases = agentKnowledgeBases
    .filter((kb) => kb.enabled)
    .map((kb) => ({ description: kb.description, id: kb.id, name: kb.name }));

  // Create MessagesEngine with injected dependencies
  /* eslint-disable sort-keys-fix/sort-keys-fix */
  const engine = new MessagesEngine({
    // Agent configuration
    enableHistoryCount,
    formatHistorySummary: historySummaryPrompt,
    historyCount,
    historySummary,
    inputTemplate,
    systemRole,

    // Capability injection
    capabilities: {
      isCanUseFC,
      isCanUseVideo,
      isCanUseVision,
    },

    // File context configuration
    fileContext: { enabled: true, includeFileUrl: !isDesktop },

    // Knowledge injection
    knowledge: {
      fileContents,
      knowledgeBases,
    },

    // Messages
    messages,

    // Model info
    model,
    provider,

    // Tools configuration
    toolsConfig: {
      getToolSystemRoles: (tools) => toolSelectors.enabledSystemRoles(tools)(getToolStoreState()),
      tools,
    },

    // User memory configuration
    userMemory: userMemories
      ? {
          enabled: !!userMemories.memories,
          fetchedAt: userMemories.fetchedAt,
          memories: userMemories.memories,
        }
      : undefined,

    // Variable generators
    variableGenerators: VARIABLE_GENERATORS,

    // Extended contexts - only pass when enabled
    ...(isAgentBuilderEnabled && { agentBuilderContext }),
    ...(agentGroup && { agentGroup }),
  });

  const result = await engine.process();
  return result.messages;
};
