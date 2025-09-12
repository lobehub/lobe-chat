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
      // 创建系统角色注入 providers

      // 1. 收件箱引导系统角色注入
      new InboxGuideProvider({
        inboxGuideSystemRole: INBOX_GUIDE_SYSTEMROLE,
        inboxSessionId: INBOX_SESSION_ID,
        isWelcomeQuestion: options?.isWelcomeQuestion,
        sessionId: options?.trace?.sessionId,
      }),

      // 2. 工具系统角色注入
      new ToolSystemRoleProvider({
        getToolSystemRoles: (tools) => toolSelectors.enabledSystemRoles(tools)(getToolStoreState()),
        isCanUseFC,
        model,
        provider,
        tools,
      }),

      // 3. 历史摘要注入
      new HistorySummaryProvider({
        formatHistorySummary: historySummaryPrompt,
        historySummary: options?.historySummary,
      }),

      // 创建消息处理 processors

      // 1. 占位符变量处理
      new PlaceholderVariablesProcessor({ variableGenerators: VARIABLE_GENERATORS }),

      // 2. 消息内容处理
      new MessageContentProcessor({
        fileContext: { enabled: isServerMode, includeFileUrl: !isDesktop },
        isCanUseVision,
        model,
        provider,
      }),

      // 3. 工具调用处理
      new ToolCallProcessor({ genToolCallingName, isCanUseFC, model, provider }),

      // 4. 工具重排
      new ToolMessageReorder(),

      // 5. 消息清理（最后一步，只保留必要字段）
      new MessageCleanupProcessor(),
    ],
  });

  const initialState: AgentState = {
    messages,
    model,
    provider,
    systemRole: '', // 将由系统角色 providers 处理
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
