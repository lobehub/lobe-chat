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
