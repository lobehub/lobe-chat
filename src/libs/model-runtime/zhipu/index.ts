import { ModelProvider } from '../types';
import { MODEL_LIST_CONFIGS, processModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { OpenAIStream } from '../utils/streams/openai';
import { convertIterableToStream } from '../utils/streams/protocol';

export interface ZhipuModelCard {
  description: string;
  modelCode: string;
  modelName: string;
}

export const LobeZhipuAI = createOpenAICompatibleRuntime({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  chatCompletion: {
    handlePayload: (payload) => {
      const { enabledSearch, max_tokens, model, temperature, thinking, tools, top_p, ...rest } =
        payload;

      const zhipuTools = enabledSearch
        ? [
            ...(tools || []),
            {
              type: 'web_search',
              web_search: {
                enable: true,
                result_sequence: 'before', // 将搜索结果返回顺序更改为 before 适配最小化 OpenAIStream 改动
                search_engine: process.env.ZHIPU_SEARCH_ENGINE || 'search_std', // search_std, search_pro
                search_result: true,
              },
            },
          ]
        : tools;

      return {
        ...rest,
        max_tokens:
          max_tokens === undefined
            ? undefined
            : (model.includes('glm-4v') && Math.min(max_tokens, 1024)) ||
              (model === 'glm-zero-preview' && Math.min(max_tokens, 15_300)) ||
              max_tokens,
        model,
        stream: true,
        thinking: model.includes('-4.5') ? { type: thinking?.type } : undefined,
        tools: zhipuTools,
        ...(model === 'glm-4-alltools'
          ? {
              temperature:
                temperature !== undefined
                  ? Math.max(0.01, Math.min(0.99, temperature / 2))
                  : undefined,
              top_p: top_p !== undefined ? Math.max(0.01, Math.min(0.99, top_p)) : undefined,
            }
          : {
              temperature: temperature !== undefined ? temperature / 2 : undefined,
              top_p,
            }),
      } as any;
    },
    handleStream: (stream, { callbacks, inputStartAt }) => {
      const readableStream =
        stream instanceof ReadableStream ? stream : convertIterableToStream(stream);

      // GLM-4.5 系列模型在 tool_calls 中返回的 index 为 -1，需要在进入 OpenAIStream 之前修正
      // 因为 OpenAIStream 内部会过滤掉 index < 0 的 tool_calls (openai.ts:58-60)
      const preprocessedStream = readableStream.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            // 处理原始的 OpenAI ChatCompletionChunk 格式
            if (chunk.choices && chunk.choices[0]) {
              const choice = chunk.choices[0];
              if (choice.delta?.tool_calls && Array.isArray(choice.delta.tool_calls)) {
                // 修正负数 index，将 -1 转换为基于数组位置的正数 index
                const fixedToolCalls = choice.delta.tool_calls.map(
                  (toolCall: any, globalIndex: number) => ({
                    ...toolCall,
                    index: toolCall.index < 0 ? globalIndex : toolCall.index,
                  }),
                );

                // 创建修正后的 chunk
                const fixedChunk = {
                  ...chunk,
                  choices: [
                    {
                      ...choice,
                      delta: {
                        ...choice.delta,
                        tool_calls: fixedToolCalls,
                      },
                    },
                  ],
                };

                controller.enqueue(fixedChunk);
              } else {
                controller.enqueue(chunk);
              }
            } else {
              controller.enqueue(chunk);
            }
          },
        }),
      );

      return OpenAIStream(preprocessedStream, {
        callbacks,
        inputStartAt,
        provider: 'zhipu',
      });
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_ZHIPU_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    // ref: https://open.bigmodel.cn/console/modelcenter/square
    const url = 'https://open.bigmodel.cn/api/fine-tuning/model_center/list?pageSize=100&pageNum=1';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${client.apiKey}`,
        'Bigmodel-Organization': 'lobehub',
        'Bigmodel-Project': 'lobechat',
      },
      method: 'GET',
    });
    const json = await response.json();

    const modelList: ZhipuModelCard[] = json.rows;

    const standardModelList = modelList.map((model) => ({
      description: model.description,
      displayName: model.modelName,
      id: model.modelCode,
    }));
    return processModelList(standardModelList, MODEL_LIST_CONFIGS.zhipu, 'zhipu');
  },
  provider: ModelProvider.ZhiPu,
});
