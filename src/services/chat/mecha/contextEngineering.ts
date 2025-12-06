import { isDesktop } from '@lobechat/const';
import {
  ContextEngine,
  GroupMessageFlattenProcessor,
  HistorySummaryProvider,
  HistoryTruncateProcessor,
  InputTemplateProcessor,
  KnowledgeInjector,
  MessageCleanupProcessor,
  MessageContentProcessor,
  PlaceholderVariablesProcessor,
  SystemRoleInjector,
  ToolCallProcessor,
  ToolMessageReorder,
  ToolNameResolver,
  ToolSystemRoleProvider,
} from '@lobechat/context-engine';
import { historySummaryPrompt } from '@lobechat/prompts';
import { OpenAIChatMessage, UIChatMessage } from '@lobechat/types';
import { VARIABLE_GENERATORS } from '@lobechat/utils/client';

import { isCanUseFC } from '@/helpers/isCanUseFC';
import { getAgentStoreState } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { getToolStoreState } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

import { isCanUseVideo, isCanUseVision } from '../helper';
import { UserMemoryInjector } from '../providers/UserMemoryInjector';
import type { UserMemoryInjectorConfig } from '../providers/UserMemoryInjector';

interface ContextEngineeringContext {
  enableHistoryCount?: boolean;
  historyCount?: number;
  historySummary?: string;
  inputTemplate?: string;
  messages: UIChatMessage[];
  model: string;
  provider: string;
  sessionId?: string;
  systemRole?: string;
  tools?: string[];
  userMemories?: UserMemoryInjectorConfig;
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
}: ContextEngineeringContext): Promise<OpenAIChatMessage[]> => {
  const toolNameResolver = new ToolNameResolver();

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

  const pipeline = new ContextEngine({
    pipeline: [
      // 1. History truncation (MUST be first, before any message injection)
      new HistoryTruncateProcessor({ enableHistoryCount, historyCount }),

      // --------- Create system role injection providers

      // 2. System role injection (agent's system role)
      new SystemRoleInjector({ systemRole }),

      // 3. Knowledge injection (full content for agent files + metadata for knowledge bases)
      new KnowledgeInjector({ fileContents, knowledgeBases }),

      // 4. Tool system role injection
      new ToolSystemRoleProvider({
        getToolSystemRoles: (tools) => toolSelectors.enabledSystemRoles(tools)(getToolStoreState()),
        isCanUseFC,
        model,
        provider,
        tools,
      }),

      // 5. History summary injection
      new HistorySummaryProvider({
        formatHistorySummary: historySummaryPrompt,
        historySummary: historySummary,
      }),

      // 6. User memory injection
      new UserMemoryInjector(userMemories ?? {}),

      // 7. Input template processing
      new InputTemplateProcessor({ inputTemplate }),

      // 8. Placeholder variables processing
      new PlaceholderVariablesProcessor({ variableGenerators: VARIABLE_GENERATORS }),

      // 9. Group message flatten (convert role=group to standard assistant + tool messages)
      new GroupMessageFlattenProcessor(),

      // 10. Message content processing
      new MessageContentProcessor({
        fileContext: { enabled: true, includeFileUrl: !isDesktop },
        isCanUseVideo,
        isCanUseVision,
        model,
        provider,
      }),

      // 11. Tool call processing
      new ToolCallProcessor({
        genToolCallingName: toolNameResolver.generate.bind(toolNameResolver),
        isCanUseFC,
        model,
        provider,
      }),

      // 12. Tool message reordering
      new ToolMessageReorder(),

      // 13. Message cleanup (final step, keep only necessary fields)
      new MessageCleanupProcessor(),
    ],
  });

  const result = await pipeline.process({ messages });

  return result.messages;
};
