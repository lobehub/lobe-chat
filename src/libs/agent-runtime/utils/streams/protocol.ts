import { ChatStreamCallbacks } from '@/libs/agent-runtime';
import { ModelTokensUsage } from '@/types/message';

import { AgentRuntimeErrorType } from '../../error';

/**
 * context in the stream to save temporarily data
 */
export interface StreamContext {
  id: string;
  /**
   * As pplx citations is in every chunk, but we only need to return it once
   * this flag is used to check if the pplx citation is returned,and then not return it again.
   * Same as Hunyuan and Wenxin
   */
  returnedCitation?: boolean;
  thinking?: {
    id: string;
    name: string;
  };
  tool?: {
    id: string;
    index: number;
    name: string;
  };
  toolIndex?: number;
  usage?: ModelTokensUsage;
}

export interface StreamProtocolChunk {
  data: any;
  id?: string;
  type: // pure text
  | 'text'
    // base64 format image
    | 'base64_image'
    // Tools use
    | 'tool_calls'
    // Model Thinking
    | 'reasoning'
    // use for reasoning signature, maybe only anthropic
    | 'reasoning_signature'
    // flagged reasoning signature
    | 'flagged_reasoning_signature'
    // Search or Grounding
    | 'grounding'
    // stop signal
    | 'stop'
    // Error
    | 'error'
    // token usage
    | 'usage'
    // unknown data result
    | 'data';
}

export interface StreamToolCallChunkData {
  function?: {
    arguments?: string;
    name?: string | null;
  };
  id?: string;
  index: number;
  type: 'function' | string;
}

export interface StreamProtocolToolCallChunk {
  data: StreamToolCallChunkData[];
  id: string;
  index: number;
  type: 'tool_calls';
}

export const generateToolCallId = (index: number, functionName?: string) =>
  `${functionName || 'unknown_tool_call'}_${index}`;

const chatStreamable = async function* <T>(stream: AsyncIterable<T>) {
  for await (const response of stream) {
    yield response;
  }
};

const ERROR_CHUNK_PREFIX = '%FIRST_CHUNK_ERROR%: ';
// make the response to the streamable format
export const convertIterableToStream = <T>(stream: AsyncIterable<T>) => {
  const iterable = chatStreamable(stream);

  // copy from https://github.com/vercel/ai/blob/d3aa5486529e3d1a38b30e3972b4f4c63ea4ae9a/packages/ai/streams/ai-stream.ts#L284
  // and add an error handle
  let it = iterable[Symbol.asyncIterator]();

  return new ReadableStream<T>({
    async cancel(reason) {
      await it.return?.(reason);
    },
    async pull(controller) {
      const { done, value } = await it.next();
      if (done) controller.close();
      else controller.enqueue(value);
    },

    async start(controller) {
      try {
        const { done, value } = await it.next();
        if (done) controller.close();
        else controller.enqueue(value);
      } catch (e) {
        const error = e as Error;

        controller.enqueue(
          (ERROR_CHUNK_PREFIX +
            JSON.stringify({ message: error.message, name: error.name, stack: error.stack })) as T,
        );
        controller.close();
      }
    },
  });
};

/**
 * Create a transformer to convert the response into an SSE format
 */
export const createSSEProtocolTransformer = (
  transformer: (chunk: any, stack: StreamContext) => StreamProtocolChunk | StreamProtocolChunk[],
  streamStack?: StreamContext,
) =>
  new TransformStream({
    transform: (chunk, controller) => {
      const result = transformer(chunk, streamStack || { id: '' });

      const buffers = Array.isArray(result) ? result : [result];

      buffers.forEach(({ type, id, data }) => {
        controller.enqueue(`id: ${id}\n`);
        controller.enqueue(`event: ${type}\n`);
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      });
    },
  });

export function createCallbacksTransformer(cb: ChatStreamCallbacks | undefined) {
  const textEncoder = new TextEncoder();
  let aggregatedText = '';
  let aggregatedThinking: string | undefined = undefined;
  let usage: ModelTokensUsage | undefined;
  let grounding: any;

  let currentType = '' as unknown as StreamProtocolChunk['type'];
  const callbacks = cb || {};

  return new TransformStream({
    async flush(): Promise<void> {
      const data = { grounding, text: aggregatedText, thinking: aggregatedThinking, usage };

      if (callbacks.onCompletion) {
        await callbacks.onCompletion(data);
      }

      if (callbacks.onFinal) {
        await callbacks.onFinal(data);
      }
    },

    async start(): Promise<void> {
      if (callbacks.onStart) await callbacks.onStart();
    },

    async transform(chunk: string, controller): Promise<void> {
      controller.enqueue(textEncoder.encode(chunk));

      // track the type of the chunk
      if (chunk.startsWith('event:')) {
        currentType = chunk.split('event:')[1].trim() as unknown as StreamProtocolChunk['type'];
      }
      // if the message is a data chunk, handle the callback
      else if (chunk.startsWith('data:')) {
        const content = chunk.split('data:')[1].trim();

        let data: any = undefined;
        try {
          data = JSON.parse(content);
        } catch {}

        if (!data) return;

        switch (currentType) {
          case 'text': {
            aggregatedText += data;
            await callbacks.onText?.(data);
            break;
          }

          case 'reasoning': {
            if (!aggregatedThinking) {
              aggregatedThinking = '';
            }

            aggregatedThinking += data;
            await callbacks.onThinking?.(data);
            break;
          }

          case 'usage': {
            usage = data;
            await callbacks.onUsage?.(data);
            break;
          }

          case 'grounding': {
            grounding = data;
            await callbacks.onGrounding?.(data);
            break;
          }

          case 'tool_calls': {
            // TODO: make on ToolCall callback
            await callbacks.onToolsCalling?.(data);
          }
        }
      }
    },
  });
}

export const FIRST_CHUNK_ERROR_KEY = '_isFirstChunkError';

export const createFirstErrorHandleTransformer = (
  errorHandler?: (errorJson: any) => any,
  provider?: string,
) => {
  return new TransformStream({
    transform(chunk, controller) {
      if (chunk.toString().startsWith(ERROR_CHUNK_PREFIX)) {
        const errorData = JSON.parse(chunk.toString().replace(ERROR_CHUNK_PREFIX, ''));

        controller.enqueue({
          ...errorData,
          [FIRST_CHUNK_ERROR_KEY]: true,
          errorType: errorHandler?.(errorData) || AgentRuntimeErrorType.ProviderBizError,
          provider,
        });
      } else {
        controller.enqueue(chunk);
      }
    },
  });
};

/**
 * create a transformer to remove SSE format data
 */
export const createSSEDataExtractor = () =>
  new TransformStream({
    transform(chunk: Uint8Array, controller) {
      // 将 Uint8Array 转换为字符串
      const text = new TextDecoder().decode(chunk, { stream: true });

      // 处理多行数据的情况
      const lines = text.split('\n');

      for (const line of lines) {
        // 只处理以 "data: " 开头的行
        if (line.startsWith('data: ')) {
          // 提取 "data: " 后面的实际数据
          const jsonText = line.slice(6);

          // 跳过心跳消息
          if (jsonText === '[DONE]') continue;

          try {
            // 解析 JSON 数据
            const data = JSON.parse(jsonText);
            // 将解析后的数据传递给下一个处理器
            controller.enqueue(data);
          } catch {
            console.warn('Failed to parse SSE data:', jsonText);
          }
        }
      }
    },
  });
