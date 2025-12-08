import { isDesktop } from '@lobechat/const';
import {
  AgentBuilderContext,
  AgentBuilderContextInjector,
  ContextEngine,
  GroupMessageFlattenProcessor,
  HistorySummaryProvider,
  HistoryTruncateProcessor,
  InputTemplateProcessor,
  KnowledgeInjector,
  MessageCleanupProcessor,
  MessageContentProcessor,
  PageEditorContext,
  PageEditorContextInjector,
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
import { AGENT_BUILDER_TOOL_ID } from '@/tools/agent-builder/const';
import { PAGE_AGENT_TOOL_ID } from '@/tools/document/const';

import { isCanUseVideo, isCanUseVision } from '../helper';
import { UserMemoryInjector } from '../providers/UserMemoryInjector';
import type { UserMemoryInjectorConfig } from '../providers/UserMemoryInjector';

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
  agentBuilderContext,
  pageEditorContext,
}: ContextEngineeringContext): Promise<OpenAIChatMessage[]> => {
  const toolNameResolver = new ToolNameResolver();

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

  const pipeline = new ContextEngine({
    pipeline: [
      // 1. History truncation (MUST be first, before any message injection)
      new HistoryTruncateProcessor({ enableHistoryCount, historyCount }),

      // --------- Create system role injection providers

      // 2. System role injection (agent's system role)
      new SystemRoleInjector({ systemRole }),

      // 3. Knowledge injection (full content for agent files + metadata for knowledge bases)
      new KnowledgeInjector({ fileContents, knowledgeBases }),

      // 4. Agent Builder context injection (current agent config/meta for editing)
      new AgentBuilderContextInjector({
        agentContext: agentBuilderContext,
        enabled: isAgentBuilderEnabled,
      }),

      // 5. Page Editor context injection (current page/document content for editing)
      (() => {
        console.log('[contextEngineering] Creating PageEditorContextInjector with:', {
          enabled: isPageAgentEnabled,
          pageContext: pageEditorContext,
        });
        return new PageEditorContextInjector({
          enabled: isPageAgentEnabled,
          pageContext: pageEditorContext,
        });
      })(),

      // 6. Tool system role injection
      new ToolSystemRoleProvider({
        getToolSystemRoles: (tools) => toolSelectors.enabledSystemRoles(tools)(getToolStoreState()),
        isCanUseFC,
        model,
        provider,
        tools,
      }),

      // 7. History summary injection
      new HistorySummaryProvider({
        formatHistorySummary: historySummaryPrompt,
        historySummary: historySummary,
      }),

      // 8. User memory injection
      new UserMemoryInjector(userMemories ?? {}),

      // 9. Input template processing
      new InputTemplateProcessor({ inputTemplate }),

      // 10. Placeholder variables processing
      new PlaceholderVariablesProcessor({ variableGenerators: VARIABLE_GENERATORS }),

      // 11. Group message flatten (convert role=group to standard assistant + tool messages)
      new GroupMessageFlattenProcessor(),

      // 12. Message content processing
      new MessageContentProcessor({
        fileContext: { enabled: true, includeFileUrl: !isDesktop },
        isCanUseVideo,
        isCanUseVision,
        model,
        provider,
      }),

      // 13. Tool call processing
      new ToolCallProcessor({
        genToolCallingName: toolNameResolver.generate.bind(toolNameResolver),
        isCanUseFC,
        model,
        provider,
      }),

      // 14. Tool message reordering
      new ToolMessageReorder(),

      // 15. Message cleanup (final step, keep only necessary fields)
      new MessageCleanupProcessor(),
    ],
  });

  const result = await pipeline.process({ messages });

  return result.messages;
};
