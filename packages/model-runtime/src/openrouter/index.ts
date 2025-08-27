import OpenRouterModels from '@/config/aiModels/openrouter';

import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { OpenAIStream } from '../utils/streams/openai';
import { convertIterableToStream, createCallbacksTransformer } from '../utils/streams/protocol';
import { OpenRouterModelCard, OpenRouterModelExtraInfo, OpenRouterReasoning } from './type';

const formatPrice = (price: string) => {
  if (price === '-1') return undefined;
  return Number((Number(price) * 1e6).toPrecision(5));
};

export const LobeOpenRouterAI = createOpenAICompatibleRuntime({
  baseURL: 'https://openrouter.ai/api/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { thinking, model, max_tokens } = payload;

      let reasoning: OpenRouterReasoning = {};

      if (thinking?.type === 'enabled') {
        const modelConfig = OpenRouterModels.find((m) => m.id === model);
        const defaultMaxOutput = modelConfig?.maxOutput;

        // 配置优先级：用户设置 > 模型配置 > 硬编码默认值
        const getMaxTokens = () => {
          if (max_tokens) return max_tokens;
          if (defaultMaxOutput) return defaultMaxOutput;
          return undefined;
        };

        const maxTokens = getMaxTokens() || 32_000; // Claude Opus 4 has minimum maxOutput

        reasoning = {
          max_tokens: thinking?.budget_tokens
            ? Math.min(thinking.budget_tokens, maxTokens - 1)
            : 1024,
        };
      }

      return {
        ...payload,
        model: payload.enabledSearch ? `${payload.model}:online` : payload.model,
        reasoning,
        stream: payload.stream ?? true,
      } as any;
    },
    handleStream: (stream, { callbacks, inputStartAt }) => {
      const readableStream =
        stream instanceof ReadableStream ? stream : convertIterableToStream(stream);

      // 处理 OpenRouter 的特殊流格式，特别是 images 数组
      const preprocessedStream = readableStream.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            // 处理原始的 OpenAI ChatCompletionChunk 格式
            if (chunk.choices && chunk.choices[0]) {
              const choice = chunk.choices[0];
              if (choice.delta && (choice.delta as any).images) {
                // 处理 images 数组，将其转换为标准的 content
                const images = (choice.delta as any).images;
                let imageContent = '';

                images.forEach((image: any) => {
                  if (image.type === 'image_url' && image.image_url?.url) {
                    // 将图片 URL 作为 markdown 图像插入到 content 中
                    imageContent += `![Generated Image](${image.image_url.url})\n`;
                  }
                });

                // 创建修正后的 chunk
                const fixedChunk = {
                  ...chunk,
                  choices: [
                    {
                      ...choice,
                      delta: {
                        ...choice.delta,
                        content: imageContent,
                        images: undefined, // 移除 images 数组
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

      // 使用 OpenAIStream 生成标准 SSE，再将包含 markdown 图片的 text 事件转换为 base64_image 事件
      const sseStream = OpenAIStream(preprocessedStream, {
        // 先不传回调，避免重复触发；稍后在图片转换后再统一回调
        inputStartAt,
        provider: 'openrouter',
      });

      // 将 Uint8Array 的 SSE 字节流解码为字符串，按事件块解析并改写图片事件
      const decoder = new TextDecoder();
      let buffer = '';

      const imageEventTransformer = new TransformStream<Uint8Array, string>({
        flush(controller) {
          if (buffer.length > 0) {
            // 残留内容直接透传
            controller.enqueue(buffer);
            buffer = '';
          }
        },
        transform(chunk, controller) {
          buffer += decoder.decode(chunk, { stream: true });

          // 处理完整的 SSE 事件块（以空行分隔）
          let sepIndex = buffer.indexOf('\n\n');
          while (sepIndex !== -1) {
            const rawEvent = buffer.slice(0, sepIndex);
            buffer = buffer.slice(sepIndex + 2);

            const lines = rawEvent.split('\n');
            let idLine = lines.find((l) => l.startsWith('id:')) || '';
            let eventLine = lines.find((l) => l.startsWith('event:')) || '';
            let dataLine = lines.find((l) => l.startsWith('data:')) || '';

            const id = idLine ? idLine.slice(3).trim() : '';
            const event = eventLine ? eventLine.slice(6).trim() : '';
            const dataText = dataLine ? dataLine.slice(5).trim() : '';

            // 默认透传
            let output = '';

            if (event === 'text') {
              // data 是 JSON 字符串，需要解析
              let parsed: any;
              try {
                parsed = JSON.parse(dataText);
              } catch {
                parsed = undefined;
              }

              if (typeof parsed === 'string' && parsed.length > 0) {
                // 提取 markdown 图片
                const regex = /!\[[^\]]*]\(([^)]+)\)/g;
                const urls: string[] = [];
                let match: RegExpExecArray | null;
                while ((match = regex.exec(parsed)) !== null) {
                  if (match[1]) urls.push(match[1]);
                }

                // 去掉 markdown 图片文本后的剩余文本
                const leftover = parsed.replaceAll(regex, '').trim();

                if (urls.length > 0) {
                  // 输出 base64_image 事件（一张图一个事件）
                  for (const url of urls) {
                    output += `id: ${id}\n`;
                    output += `event: base64_image\n`;
                    output += `data: ${JSON.stringify(url)}\n\n`;
                  }

                  // 如果还有剩余文本，保留为原始 text 事件
                  if (leftover.length > 0) {
                    output += `id: ${id}\n`;
                    output += `event: text\n`;
                    output += `data: ${JSON.stringify(leftover)}\n\n`;
                  }

                  // 完成改写
                  controller.enqueue(output);
                } else {
                  // 非图片文本，原样透传
                  controller.enqueue(rawEvent + '\n\n');
                }
              } else {
                controller.enqueue(rawEvent + '\n\n');
              }
            } else {
              // 其它事件类型直接透传（usage/stop/reasoning/tool_calls/grounding/speed/...）
              controller.enqueue(rawEvent + '\n\n');
            }

            sepIndex = buffer.indexOf('\n\n');
          }
        },
      });

      return sseStream
        .pipeThrough(imageEventTransformer)
        .pipeThrough(createCallbacksTransformer(callbacks));
    },
  },
  constructorOptions: {
    defaultHeaders: {
      'HTTP-Referer': 'https://lobehub.com',
      'X-Title': 'LobeHub',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENROUTER_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: OpenRouterModelCard[] = modelsPage.data;

    const modelsExtraInfo: OpenRouterModelExtraInfo[] = [];
    try {
      const response = await fetch('https://openrouter.ai/api/frontend/models');
      if (response.ok) {
        const data = await response.json();
        modelsExtraInfo.push(...data['data']);
      }
    } catch (error) {
      console.error('Failed to fetch OpenRouter frontend models:', error);
    }

    // 先处理抓取的模型信息，转换为标准格式
    const formattedModels = modelList.map((model) => {
      const extraInfo = modelsExtraInfo.find(
        (m) => m.slug.toLowerCase() === model.id.toLowerCase(),
      );

      return {
        contextWindowTokens: model.context_length,
        description: model.description,
        displayName: model.name,
        functionCall:
          model.description.includes('function calling') ||
          model.description.includes('tools') ||
          extraInfo?.endpoint?.supports_tool_parameters ||
          false,
        id: model.id,
        maxOutput:
          typeof model.top_provider.max_completion_tokens === 'number'
            ? model.top_provider.max_completion_tokens
            : undefined,
        pricing: {
          input: formatPrice(model.pricing.prompt),
          output: formatPrice(model.pricing.completion),
        },
        reasoning: extraInfo?.endpoint?.supports_reasoning || false,
        releasedAt: new Date(model.created * 1000).toISOString().split('T')[0],
        vision: model.architecture.modality.includes('image') || false,
      };
    });

    return await processMultiProviderModelList(formattedModels, 'openrouter');
  },
  provider: ModelProvider.OpenRouter,
});
