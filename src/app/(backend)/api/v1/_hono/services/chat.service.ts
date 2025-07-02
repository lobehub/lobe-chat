import { DEFAULT_AGENT_CHAT_CONFIG } from '@/const/settings';
import { LobeChatDatabase } from '@/database/type';
import { initAgentRuntimeWithUserPayload } from '@/server/modules/AgentRuntime';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { LobeAgentChatConfig } from '@/types/agent/chatConfig';
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
   * 获取 Agent 的配置信息
   * @param agentId Agent ID
   * @returns Agent 配置
   */
  private async getAgentConfig(agentId: string): Promise<LobeAgentChatConfig | null> {
    try {
      const agent = await this.db.query.agents.findFirst({
        where: (agents, { eq, and }) => and(eq(agents.id, agentId)),
      });

      return agent?.chatConfig || null;
    } catch (error) {
      this.log('warn', '获取 Agent 配置失败', {
        agentId,
        error: error instanceof Error ? error.message : String(error),
        userId: this.userId,
      });
      return null;
    }
  }

  /**
   * 合并 chatConfig 配置
   * @param agentConfig Agent 的配置
   * @param userConfig 用户传入的配置
   * @returns 合并后的配置
   */
  private mergeChatConfig(
    agentConfig: LobeAgentChatConfig | null,
    userConfig?: Partial<LobeAgentChatConfig>,
  ): LobeAgentChatConfig {
    // 按优先级合并：用户配置 > Agent配置 > 默认配置
    return {
      ...DEFAULT_AGENT_CHAT_CONFIG,
      ...agentConfig,
      ...userConfig,
    };
  }

  /**
   * 根据 chatConfig 构建搜索相关参数
   * @param chatConfig 聊天配置
   * @returns 搜索参数
   */
  private buildSearchParams(chatConfig: LobeAgentChatConfig) {
    const enabledSearch = chatConfig.searchMode !== 'off';
    const useModelBuiltinSearch = chatConfig.useModelBuiltinSearch;

    return {
      enabledSearch: enabledSearch && useModelBuiltinSearch,
      searchFCModel: chatConfig.searchFCModel,
    };
  }

  /**
   * 获取AI Provider的API Key
   * @param provider 提供商ID
   * @returns API Key
   */
  private async getApiKey(provider: string) {
    const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();

    const aiProviderConfigs = await this.db.query.aiProviders.findMany({
      where: (aiProviders, { eq, and }) =>
        and(
          eq(aiProviders.userId, this.userId!),
          eq(aiProviders.id, provider),
          eq(aiProviders.enabled, true),
        ),
    });

    if (!aiProviderConfigs || aiProviderConfigs.length === 0) {
      this.log('info', '未找到有效的AI Provider配置，使用兜底环境变量配置', {
        provider,
        userId: this.userId,
      });

      return '{}';
    }

    const providerConfig = aiProviderConfigs[0];
    const { plaintext } = await gateKeeper.decrypt(providerConfig.keyVaults!);

    return plaintext;
  }

  /**
   * 解析SSE格式的响应内容
   * @param text SSE格式的文本
   * @returns 解析出的内容
   */
  private parseSSEContent(text: string): string {
    const lines = text.split('\n');
    let content = '';

    for (const line of lines) {
      if (line.startsWith('data: ') && !line.includes('[DONE]') && !line.includes('STOP')) {
        try {
          const dataJson = line.slice(6);
          const data = JSON.parse(dataJson);

          // 处理标准的OpenAI Chat Completion格式
          if (data.choices?.[0]?.delta?.content) {
            content += data.choices[0].delta.content;
          } else if (data.choices?.[0]?.message?.content) {
            content = data.choices[0].message.content;
          }
          // 处理直接字符串内容（OpenAI Reasoning模式）
          else if (typeof data === 'string') {
            content += data;
          }
        } catch {
          // 忽略解析错误
        }
      }
    }

    return content;
  }

  /**
   * 处理流式响应
   * @param response 响应对象
   * @returns 完整的响应内容
   */
  private async handleStreamResponse(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法获取响应流');

    let finalContent = '';
    const decoder = new TextDecoder();

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const parsedContent = this.parseSSEContent(chunk);
        finalContent += parsedContent;
      }
    } finally {
      reader.releaseLock();
    }

    // 移除可能的结尾控制字符
    return finalContent.replace(/\s*stop\s*$/i, '').trim();
  }

  /**
   * 处理非流式响应
   * @param response 响应对象
   * @returns 解析后的JSON数据
   */
  private async handleNonStreamResponse(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      // 如果JSON解析失败，尝试读取文本内容
      const text = await response.text();

      // 尝试从文本中提取内容
      if (text.includes('data: ')) {
        const content = this.parseSSEContent(text);
        if (content) {
          return {
            choices: [
              {
                message: {
                  content,
                  role: 'assistant',
                },
              },
            ],
          };
        }
      }

      throw new Error(`响应解析失败: ${text.slice(0, 100)}`);
    }
  }

  /**
   * 通用聊天接口
   * @param params 聊天参数
   * @param options 附加选项
   * @returns 聊天响应
   */
  async chat(
    params: ChatServiceParams,
    options?: { enabledSearch?: boolean },
  ): ServiceResult<ChatServiceResponse> {
    const provider = params.provider || this.config.defaultProvider!;
    const model = params.model || this.config.defaultModel!;

    this.log('info', '开始聊天对话', {
      messageCount: params.messages.length,
      model,
      provider,
      userId: this.userId,
    });

    try {
      const { apiKey } = JSON.parse(await this.getApiKey(provider));

      // 创建 AgentRuntime 实例
      const agentRuntime = await initAgentRuntimeWithUserPayload(provider, {
        apiKey,
        userId: this.userId!,
      });

      // 构建 ChatStreamPayload
      const chatPayload: ChatStreamPayload = {
        max_tokens: params.max_tokens,
        messages: params.messages,
        model,
        stream: params.stream,
        temperature: params.temperature || 1,
        ...(options?.enabledSearch && {
          enabledSearch: options.enabledSearch,
        }),
      };

      // 调用聊天 API
      const response = await agentRuntime.chat(chatPayload, {
        user: this.userId!,
      });

      // 检查响应类型
      const contentType = response.headers.get('content-type') || '';

      // 统一处理流式和非流式响应
      let result;
      if (contentType.includes('text/stream') || contentType.includes('text/event-stream')) {
        const content = await this.handleStreamResponse(response);
        result = {
          choices: [
            {
              message: {
                content,
                role: 'assistant',
              },
            },
          ],
        };
      } else {
        result = await this.handleNonStreamResponse(response);
      }

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
      // 改进错误日志记录，提供更详细的错误信息
      let errorDetails: any;

      console.log('error', error);

      if (error instanceof Error) {
        errorDetails = {
          message: error.message,
          name: error.name,
        };
      } else if (typeof error === 'object' && error !== null) {
        try {
          errorDetails = structuredClone(error);
        } catch {
          errorDetails = { rawError: String(error) };
        }
      } else {
        errorDetails = { rawError: String(error) };
      }

      this.log('error', '聊天对话失败', {
        error: errorDetails,
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
    this.log('info', '开始生成消息回复', {
      agentId: params.agentId,
      hasUserChatConfig: !!params.chatConfig,
      historyLength: params.conversationHistory.length,
      sessionId: params.sessionId,
      userId: this.userId,
    });

    try {
      // 1. 获取 Agent 配置（如果有 agentId）
      let agentConfig: LobeAgentChatConfig | null = null;
      if (params.agentId) {
        agentConfig = await this.getAgentConfig(params.agentId);
      }

      // 2. 合并配置：用户配置 > Agent配置 > 默认配置
      const mergedChatConfig = this.mergeChatConfig(agentConfig, params.chatConfig);

      // 3. 构建搜索参数
      const searchParams = this.buildSearchParams(mergedChatConfig);

      this.log('info', '会话配置合并完成', {
        enabledSearch: searchParams.enabledSearch,
        searchMode: mergedChatConfig.searchMode,
        useModelBuiltinSearch: mergedChatConfig.useModelBuiltinSearch,
      });

      // 5. 构建对话历史
      const messages = [
        ...params.conversationHistory,
        { content: params.userMessage, role: 'user' as const },
      ];

      // 6. 调用聊天服务生成回复，传递搜索参数
      const response = await this.chat(
        {
          messages,
          model: params.model,
          provider: params.provider,
          stream: false,
          temperature: 0.7, // 适中的温度以保持回复的创造性
        },
        {
          enabledSearch: searchParams.enabledSearch,
        },
      );

      this.log('info', '生成消息回复完成', {
        model: params.model,
        provider: params.provider,
        replyLength: response.content.length,
        usedSearch: searchParams.enabledSearch,
      });

      return response.content;
    } catch (error) {
      this.log('error', '生成消息回复失败', {
        agentId: params.agentId,
        error: error instanceof Error ? error.message : String(error),
        hasUserChatConfig: !!params.chatConfig,
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
