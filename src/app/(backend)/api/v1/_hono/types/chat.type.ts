import { z } from 'zod';

/**
 * 聊天服务参数
 */
export interface ChatServiceParams {
  max_tokens?: number;
  messages: Array<{
    content: string;
    role: 'user' | 'assistant' | 'system';
  }>;
  model?: string;
  provider?: string;
  stream?: boolean;
  temperature?: number;
}

/**
 * 翻译服务参数
 */
export interface TranslateServiceParams {
  fromLanguage?: string;
  model?: string;
  provider?: string;
  text: string;
  toLanguage: string;
}

/**
 * 消息生成参数
 */
export interface MessageGenerationParams {
  agentId?: string;
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
  max_tokens: z.number().min(1).optional(),
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
  model: z.string().optional(),
  provider: z.string().optional(),
  stream: z.boolean().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export const TranslateServiceParamsSchema = z.object({
  fromLanguage: z.string().optional(),
  model: z.string().optional(),
  provider: z.string().optional(),
  text: z.string().min(1, '待翻译文本不能为空'),
  toLanguage: z.string().min(1, '目标语言不能为空'),
});

export const MessageGenerationParamsSchema = z.object({
  agentId: z.string().optional(),
  conversationHistory: z.array(
    z.object({
      content: z.string().min(1, '消息内容不能为空'),
      role: z.enum(['user', 'assistant', 'system']),
    }),
  ),
  model: z.string().optional(),
  provider: z.string().optional(),
  sessionId: z.string().nullable(),
  userMessage: z.string().min(1, '用户消息不能为空'),
});
