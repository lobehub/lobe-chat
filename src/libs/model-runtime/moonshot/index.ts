import type { ChatModelCard } from '@/types/llm';

import { ChatStreamPayload, ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface MoonshotModelCard {
  id: string;
}

export const LobeMoonshotAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.moonshot.cn/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { enabledSearch, messages, temperature, tools, ...rest } = payload;

      // 为 assistant 空消息添加一个空格 (#8418)
      const filteredMessages = messages.map(message => {
        if (message.role === 'assistant' && (!message.content || message.content === '')) {
          return { ...message, content: ' ' };
        }
        return message;
      });

      const moonshotTools = enabledSearch
        ? [
            ...(tools || []),
            {
              function: {
                name: '$web_search',
              },
              type: 'builtin_function',
            },
          ]
        : tools;

      return {
        ...rest,
        messages: filteredMessages,
        temperature: temperature !== undefined ? temperature / 2 : undefined,
        tools: moonshotTools,
      } as any;
    },
    // 添加流式响应处理
    handleStream: (stream) => {
      // 如果是标准的 ReadableStream，直接返回
      if (stream instanceof ReadableStream) {
        return stream;
      }
      
      // 处理 Stream<ChatCompletionChunk> 类型
      return new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream as any) {
              // 处理 Moonshot 特殊的流式响应格式
              if (chunk.choices?.[0]?.delta?.tool_calls) {
                const toolCall = chunk.choices[0].delta.tool_calls[0];
                
                // 处理 builtin_function 类型的工具调用
                if (toolCall.type === 'builtin_function' && toolCall.function?.name === '$web_search') {
                  // 自动执行内置搜索并返回结果
                  const searchResult = {
                    role: 'assistant',
                    content: '',
                    tool_calls: [{
                      id: toolCall.id,
                      type: 'function',
                      function: {
                        name: '$web_search',
                        arguments: toolCall.function.arguments || '{}',
                      },
                    }],
                  };
                  
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                    choices: [{ delta: searchResult }]
                  })}\n\n`));
                }
              }
              
              // 编码并发送原始块数据
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_MOONSHOT_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const functionCallKeywords = ['moonshot-v1', 'kimi-latest'];

    const visionKeywords = ['kimi-latest', 'kimi-thinking', 'vision'];

    const reasoningKeywords = ['thinking'];

    const modelsPage = (await client.models.list()) as any;
    const modelList: MoonshotModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            functionCallKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.id,
          reasoning:
            reasoningKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.reasoning ||
            false,
          vision:
            visionKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.vision ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Moonshot,
});
