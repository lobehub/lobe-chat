import { INBOX_SESSION_ID, isServerMode } from '@lobechat/const';
import {
  type AgentState,
  ContextPipeline,
  HistorySummaryProvider,
  InboxGuideProvider,
  MessageContentProcessor,
  ToolCallProcessor,
  ToolMessageReorder,
  ToolSystemRoleProvider,
} from '@lobechat/context-engine';
import { parseDataUri } from '@lobechat/model-runtime';
import { historySummaryPrompt } from '@lobechat/prompts';
import { ChatImageItem, ChatMessage, OpenAIChatMessage } from '@lobechat/types';
import { imageUrlToBase64, isLocalUrl } from '@lobechat/utils';

import { INBOX_GUIDE_SYSTEMROLE } from '@/const/guide';
import { getToolStoreState } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { genToolCallingName } from '@/utils/toolCall';

import { isCanUseFC, isCanUseVision } from './helper';
import { FetchOptions } from './types';

/**
 * Process imageList: convert local URLs to base64 and format as UserMessageContentPart
 */
export const processImageList = async ({
  model,
  provider,
  imageList,
}: {
  imageList: ChatImageItem[];
  model: string;
  provider: string;
}) => {
  if (!isCanUseVision(model, provider)) {
    return [];
  }

  return Promise.all(
    imageList.map(async (image) => {
      const { type } = parseDataUri(image.url);

      let processedUrl = image.url;
      if (type === 'url' && isLocalUrl(image.url)) {
        const { base64, mimeType } = await imageUrlToBase64(image.url);
        processedUrl = `data:${mimeType};base64,${base64}`;
      }

      return { image_url: { detail: 'auto', url: processedUrl }, type: 'image_url' } as const;
    }),
  );
};

export const processMessages = async (
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
  // 创建系统角色注入 providers
  const systemRoleProviders = [
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
  ];

  // 创建消息处理 processors
  const messageProcessors = [
    // 1. 消息内容处理
    new MessageContentProcessor({
      isAddFileContext: isServerMode,
      isCanUseVision,
      model,
      provider,
    }),

    // 2. 工具调用处理
    new ToolCallProcessor({
      genToolCallingName,
      isCanUseFC,
      model,
      provider,
    }),

    // 3. 工具重排
    new ToolMessageReorder(),
  ];

  const pipeline = new ContextPipeline([...systemRoleProviders, ...messageProcessors]);

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
