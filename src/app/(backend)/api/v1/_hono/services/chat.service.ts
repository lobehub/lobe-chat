import { LobeChatDatabase } from '@/database/type';
import { initAgentRuntimeWithUserPayload } from '@/server/modules/AgentRuntime';
import { ChatStreamPayload } from '@/types/openai/chat';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  AIProvider,
  ChatServiceConfig,
  ChatServiceParams,
  ChatServiceResponse,
  MessageGenerationParams,
  TranslateServiceParams,
} from '../types/chat.type';

/**
 * 聊天服务类
 * 提供与大模型对话的统一接口，支持对话、翻译、消息生成等功能
 */
export class ChatService extends BaseService {
  private config: ChatServiceConfig;

  constructor(db: LobeChatDatabase, userId: string | null, config?: ChatServiceConfig) {
    super(db, userId);
    this.config = {
      defaultModel: 'gpt-3.5-turbo',
      defaultProvider: 'openai',
      timeout: 30_000,
      ...config,
    };
  }

  /**
   * 通用聊天接口
   * @param params 聊天参数
   * @returns 聊天响应
   */
  async chat(params: ChatServiceParams): ServiceResult<ChatServiceResponse> {
    const provider = params.provider || this.config.defaultProvider!;
    const model = params.model || this.config.defaultModel!;

    this.log('info', '开始聊天对话', {
      messageCount: params.messages.length,
      model,
      provider,
      userId: this.userId,
    });

    try {
      // 创建 AgentRuntime 实例
      const agentRuntime = await initAgentRuntimeWithUserPayload(provider, {
        userId: this.userId!,
      });

      // 构建 ChatStreamPayload
      const chatPayload: ChatStreamPayload = {
        max_tokens: params.max_tokens,
        messages: params.messages,
        model,
        stream: params.stream || false,
        temperature: params.temperature || 1,
      };

      // 调用聊天 API
      const response = await agentRuntime.chat(chatPayload, {
        user: this.userId!,
      });

      // 处理流式响应
      if (params.stream) {
        // 对于流式响应，直接返回 Response 对象
        return response as any;
      }

      // 处理非流式响应
      const result = await response.json();

      this.log('info', '聊天对话完成', {
        hasContent: !!result.choices?.[0]?.message?.content,
        model,
        provider,
      });

      return {
        content: result.choices?.[0]?.message?.content || '',
        model,
        provider,
        usage: result.usage,
      };
    } catch (error) {
      this.log('error', '聊天对话失败', {
        error: error instanceof Error ? error.message : String(error),
        model,
        provider,
      });
      throw this.createCommonError('聊天对话失败');
    }
  }

  /**
   * 翻译文本
   * @param params 翻译参数
   * @returns 翻译结果
   */
  async translate(params: TranslateServiceParams): ServiceResult<string> {
    if (!this.userId) {
      throw this.createAuthError('未授权操作');
    }

    const provider = params.provider || this.config.defaultProvider!;
    const model = params.model || this.config.defaultModel!;

    this.log('info', '开始翻译文本', {
      fromLanguage: params.fromLanguage,
      model,
      provider,
      textLength: params.text.length,
      toLanguage: params.toLanguage,
      userId: this.userId,
    });

    try {
      // 构建翻译prompt
      const systemPrompt = `你是一个专业的翻译助手。请将用户提供的文本${
        params.fromLanguage ? `从${params.fromLanguage}` : ''
      }翻译成${params.toLanguage}。只返回翻译结果，不要添加任何解释或额外内容。`;

      const messages = [
        { content: systemPrompt, role: 'system' as const },
        { content: params.text, role: 'user' as const },
      ];

      // 调用聊天服务进行翻译
      const response = await this.chat({
        messages,
        model,
        provider,
        stream: false,
        temperature: 0.3, // 较低的温度以确保翻译的一致性
      });

      this.log('info', '翻译文本完成', {
        model,
        provider,
        resultLength: response.content.length,
      });

      return response.content;
    } catch (error) {
      this.log('error', '翻译文本失败', {
        error: error instanceof Error ? error.message : String(error),
        model,
        provider,
      });
      throw this.createCommonError('翻译失败');
    }
  }

  /**
   * 生成消息回复
   * @param params 消息生成参数
   * @returns 生成的回复内容
   */
  async generateReply(params: MessageGenerationParams): ServiceResult<string> {
    if (!this.userId) {
      throw this.createAuthError('未授权操作');
    }

    const provider = params.provider || this.config.defaultProvider!;
    const model = params.model || this.config.defaultModel!;

    this.log('info', '开始生成消息回复', {
      historyLength: params.conversationHistory.length,
      model,
      provider,
      sessionId: params.sessionId,
      userId: this.userId,
    });

    try {
      // 构建对话历史
      const messages = [
        ...params.conversationHistory,
        { content: params.userMessage, role: 'user' as const },
      ];

      // 调用聊天服务生成回复
      const response = await this.chat({
        messages,
        model,
        provider,
        stream: false,
        temperature: 0.7, // 适中的温度以保持回复的创造性
      });

      this.log('info', '生成消息回复完成', {
        model,
        provider,
        replyLength: response.content.length,
      });

      return response.content;
    } catch (error) {
      this.log('error', '生成消息回复失败', {
        error: error instanceof Error ? error.message : String(error),
        model,
        provider,
      });
      throw this.createCommonError('生成回复失败');
    }
  }

  /**
   * 检查服务可用性
   * @param provider AI提供商
   * @returns 是否可用
   */
  async checkAvailability(provider?: AIProvider): ServiceResult<boolean> {
    const targetProvider = provider || this.config.defaultProvider!;

    try {
      const agentRuntime = await initAgentRuntimeWithUserPayload(targetProvider, {
        userId: this.userId || 'test',
      });

      return !!agentRuntime;
    } catch (error) {
      this.log('warn', '检查服务可用性失败', {
        error: error instanceof Error ? error.message : String(error),
        provider: targetProvider,
      });
      return false;
    }
  }
}
