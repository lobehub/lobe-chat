import { INBOX_GUIDE_SYSTEMROLE, INBOX_SESSION_ID, isDesktop, isServerMode } from '@lobechat/const';
import {
  ContextEngine,
  HistorySummaryProvider,
  HistoryTruncateProcessor,
  InboxGuideProvider,
  InputTemplateProcessor,
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
import { getToolStoreState } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

import { isCanUseVideo, isCanUseVision } from './helper';
import { UserMemoryInjector } from './providers/UserMemoryInjector';
import type { UserMemoryInjectorConfig } from './providers/UserMemoryInjector';

interface ContextEngineeringContext {
  enableHistoryCount?: boolean;
  historyCount?: number;
  historySummary?: string;
  inputTemplate?: string;
  isWelcomeQuestion?: boolean;
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
  sessionId,
  isWelcomeQuestion,
}: ContextEngineeringContext): Promise<OpenAIChatMessage[]> => {
  const toolNameResolver = new ToolNameResolver();

  const pipeline = new ContextEngine({
    pipeline: [
      // 1. History truncation (MUST be first, before any message injection)
      new HistoryTruncateProcessor({ enableHistoryCount, historyCount }),

      // --------- Create system role injection providers

      // 2. System role injection (agent's system role)
      new SystemRoleInjector({ systemRole }),

      // 3. Inbox guide system role injection
      new InboxGuideProvider({
        inboxGuideSystemRole: INBOX_GUIDE_SYSTEMROLE,
        inboxSessionId: INBOX_SESSION_ID,
        isWelcomeQuestion: isWelcomeQuestion,
        sessionId: sessionId,
      }),

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
      new InputTemplateProcessor({
        inputTemplate,
      }),

      // 8. Placeholder variables processing
      new PlaceholderVariablesProcessor({ variableGenerators: VARIABLE_GENERATORS }),

      // 9. Message content processing
      new MessageContentProcessor({
        fileContext: { enabled: isServerMode, includeFileUrl: !isDesktop },
        isCanUseVideo,
        isCanUseVision,
        model,
        provider,
      }),

      // 10. Tool call processing
      new ToolCallProcessor({
        genToolCallingName: toolNameResolver.generate.bind(toolNameResolver),
        isCanUseFC,
        model,
        provider,
      }),

      // 11. Tool message reordering
      new ToolMessageReorder(),

      // 12. Message cleanup (final step, keep only necessary fields)
      new MessageCleanupProcessor(),
    ],
  });

  const result = await pipeline.process({ messages });

  return result.messages;
};
