import { z } from 'zod';

import { LobeAgentChatConfig } from '@/types/agent/chatConfig';
import { OpenAIChatMessage } from '@/types/openai/chat';

/**
 * 聊天服务参数
 */
export interface ChatServiceParams {
  frequency_penalty?: number;
  max_tokens?: number;
  messages: OpenAIChatMessage[];
  model?: string;
  n?: number;
  presence_penalty?: number;
  provider?: string;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
}

/**
 * 翻译服务参数
 */
export interface TranslateServiceParams {
  fromLanguage?: string;
  model?: string;
  provider?: string;
  sessionId?: string | null;
  text: string;
  toLanguage: string;
}

/**
 * 消息生成参数
 */
export interface MessageGenerationParams {
  agentId?: string;
  chatConfig?: Partial<LobeAgentChatConfig>;
  conversationHistory: Array<{
    content: string;
    role: 'user' | 'assistant' | 'system';
  }>;
  model?: string;
  provider?: string;
  sessionId: string | null;
  userMessage: string;
}

/**
 * 聊天响应
 */
export interface ChatServiceResponse {
  content: string;
  model?: string;
  provider?: string;
  usage?: {
    completion_tokens?: number;
    prompt_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * 支持的AI提供商
 */
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'groq' | 'vertexai';

/**
 * Chat Service配置
 */
export interface ChatServiceConfig {
  defaultModel?: string;
  defaultProvider?: AIProvider;
  timeout?: number;
}

// Zod Schemas for validation
export const ChatServiceParamsSchema = z.object({
  max_tokens: z.number().min(1).nullish(),
  messages: z
    .array(
      z.object({
        content: z.string().min(1, '消息内容不能为空'),
        role: z.enum(['user', 'assistant', 'system'], {
          required_error: '角色必须为user、assistant或system',
        }),
      }),
    )
    .min(1, '消息列表不能为空'),
  model: z.string().nullish(),
  provider: z.string().nullish(),
  stream: z.boolean().nullish(),
  temperature: z.number().min(0).max(2).nullish(),
});

export const TranslateServiceParamsSchema = z.object({
  fromLanguage: z.string().nullish(),
  model: z.string().nullish(),
  provider: z.string().nullish(),
  text: z.string().min(1, '待翻译文本不能为空'),
  toLanguage: z.string().min(1, '目标语言不能为空'),
});

export const MessageGenerationParamsSchema = z.object({
  agentId: z.string().nullish(),
  chatConfig: z
    .object({
      autoCreateTopicThreshold: z.number().nullish(),
      disableContextCaching: z.boolean().nullish(),
      displayMode: z.enum(['chat', 'docs']).nullish(),
      enableAutoCreateTopic: z.boolean().nullish(),
      enableCompressHistory: z.boolean().nullish(),
      enableHistoryCount: z.boolean().nullish(),
      enableMaxTokens: z.boolean().nullish(),
      enableReasoning: z.boolean().nullish(),
      enableReasoningEffort: z.boolean().nullish(),
      historyCount: z.number().nullish(),
      inputTemplate: z.string().nullish(),
      reasoningBudgetToken: z.number().nullish(),
      reasoningEffort: z.enum(['low', 'medium', 'high']).nullish(),
      searchMode: z.enum(['off', 'on', 'auto']).nullish(),
      thinkingBudget: z.number().nullish(),
      useModelBuiltinSearch: z.boolean().nullish(),
    })
    .nullish(),
  conversationHistory: z.array(
    z.object({
      content: z.string().min(1, '消息内容不能为空'),
      role: z.enum(['user', 'assistant', 'system']),
    }),
  ),
  model: z.string().nullish(),
  provider: z.string().nullish(),
  sessionId: z.string().nullable(),
  userMessage: z.string().nullish(),
});
