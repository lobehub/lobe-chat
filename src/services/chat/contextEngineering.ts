import { INBOX_SESSION_ID, isDesktop, isServerMode } from '@lobechat/const';
import {
  type AgentState,
  ContextEngine,
  HistorySummaryProvider,
  InboxGuideProvider,
  MessageCleanupProcessor,
  MessageContentProcessor,
  PlaceholderVariablesProcessor,
  ToolCallProcessor,
  ToolMessageReorder,
  ToolSystemRoleProvider,
} from '@lobechat/context-engine';
import { historySummaryPrompt } from '@lobechat/prompts';
import { ChatMessage, OpenAIChatMessage } from '@lobechat/types';

import { INBOX_GUIDE_SYSTEMROLE } from '@/const/guide';
import { getToolStoreState } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { VARIABLE_GENERATORS } from '@/utils/client/parserPlaceholder';
import { genToolCallingName } from '@/utils/toolCall';

import { isCanUseFC, isCanUseVision } from './helper';
import { FetchOptions } from './types';

export const contextEngineering = async (
  {
    messages = [],
    tools,
    model,
    provider,
  }: {
    messages: ChatMessage[];
    model: string;
    provider: string;
    tools?: string[];
  },
  options?: FetchOptions,
): Promise<OpenAIChatMessage[]> => {
  const pipeline = new ContextEngine({
    pipeline: [
      // Create system role injection providers

      // 1. Inbox guide system role injection
      new InboxGuideProvider({
        inboxGuideSystemRole: INBOX_GUIDE_SYSTEMROLE,
        inboxSessionId: INBOX_SESSION_ID,
        isWelcomeQuestion: options?.isWelcomeQuestion,
        sessionId: options?.trace?.sessionId,
      }),

      // 2. Tool system role injection
      new ToolSystemRoleProvider({
        getToolSystemRoles: (tools) => toolSelectors.enabledSystemRoles(tools)(getToolStoreState()),
        isCanUseFC,
        model,
        provider,
        tools,
      }),

      // 3. History summary injection
      new HistorySummaryProvider({
        formatHistorySummary: historySummaryPrompt,
        historySummary: options?.historySummary,
      }),

      // Create message processing processors

      // 1. Placeholder variables processing
      new PlaceholderVariablesProcessor({ variableGenerators: VARIABLE_GENERATORS }),

      // 2. Message content processing
      new MessageContentProcessor({
        fileContext: { enabled: isServerMode, includeFileUrl: !isDesktop },
        isCanUseVision,
        model,
        provider,
      }),

      // 3. Tool call processing
      new ToolCallProcessor({ genToolCallingName, isCanUseFC, model, provider }),

      // 4. Tool message reordering
      new ToolMessageReorder(),

      // 5. Message cleanup (final step, keep only necessary fields)
      new MessageCleanupProcessor(),
    ],
  });

  const initialState: AgentState = {
    messages,
    model,
    provider,
    systemRole: '', // Will be handled by system role providers
    tools: tools,
  };

  const result = await pipeline.process({
    initialState,
    maxTokens: 10_000_000,
    messages,
    model,
  });

  return result.messages;
};
