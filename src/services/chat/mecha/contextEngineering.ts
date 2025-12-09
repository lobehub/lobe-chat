import { isDesktop } from '@lobechat/const';
import { AgentBuilderContext, MessagesEngine, PageEditorContext } from '@lobechat/context-engine';
import { historySummaryPrompt } from '@lobechat/prompts';
import { OpenAIChatMessage, UIChatMessage } from '@lobechat/types';
import { VARIABLE_GENERATORS } from '@lobechat/utils/client';

import { isCanUseFC } from '@/helpers/isCanUseFC';
import { getAgentStoreState } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { getToolStoreState } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { AGENT_BUILDER_TOOL_ID } from '@/tools/agent-builder/const';
import { PAGE_AGENT_TOOL_ID } from '@/tools/document/const';

import { isCanUseVideo, isCanUseVision } from '../helper';
import type { UserMemoriesResult } from './memoryManager';

interface ContextEngineeringContext {
  /** Agent Builder context for injecting current agent info */
  agentBuilderContext?: AgentBuilderContext;
  enableHistoryCount?: boolean;
  historyCount?: number;
  historySummary?: string;
  inputTemplate?: string;
  messages: UIChatMessage[];
  model: string;
  /** Page Editor context for injecting current page/document info */
  pageEditorContext?: PageEditorContext;
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
  pageEditorContext,
}: ContextEngineeringContext): Promise<OpenAIChatMessage[]> => {
  console.log('[contextEngineering] tools:', tools);
  console.log('[contextEngineering] pageEditorContext:', pageEditorContext);

  // Check if Agent Builder tool is enabled
  const isAgentBuilderEnabled = tools?.includes(AGENT_BUILDER_TOOL_ID) ?? false;

  // Check if Page Agent tool is enabled
  const isPageAgentEnabled = tools?.includes(PAGE_AGENT_TOOL_ID) ?? false;

  console.log('[contextEngineering] isAgentBuilderEnabled:', isAgentBuilderEnabled);
  console.log('[contextEngineering] isPageAgentEnabled:', isPageAgentEnabled);

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
    ...(isPageAgentEnabled && { pageEditorContext }),
  });

  const result = await engine.process();
  return result.messages;
};
