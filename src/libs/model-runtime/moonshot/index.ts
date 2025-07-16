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
      return new ReadableStream({
        start(controller) {
          const reader = stream.getReader();
          
          const processChunk = async () => {
            try {
              const { done, value } = await reader.read();
              
              if (done) {
                controller.close();
                return;
              }
              
              // 处理 Moonshot 特殊的流式响应格式
              const text = new TextDecoder().decode(value);
              const lines = text.split('\n').filter(line => line.trim());
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;
                  
                  try {
                    const parsed = JSON.parse(data);
                    // 处理 $web_search 的特殊响应格式
                    if (parsed.choices?.[0]?.delta?.tool_calls) {
                      const toolCall = parsed.choices[0].delta.tool_calls[0];
                      
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
                  } catch (e) {
                    // 忽略解析错误
                  }
                }
              }
              
              controller.enqueue(value);
              await processChunk();
            } catch (error) {
              controller.error(error);
            }
          };
          
          processChunk();
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
