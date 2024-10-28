import { ChatStreamCallbacks } from '@/libs/agent-runtime';

import { AgentRuntimeErrorType } from '../../error';

export interface StreamStack {
  id: string;
  tool?: {
    id: string;
    index: number;
    name: string;
  };
  toolIndex?: number;
}

export interface StreamProtocolChunk {
  data: any;
  id?: string;
  type: 'text' | 'tool_calls' | 'data' | 'stop' | 'error';
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
  transformer: (chunk: any, stack: StreamStack) => StreamProtocolChunk,
  streamStack?: StreamStack,
) =>
  new TransformStream({
    transform: (chunk, controller) => {
      const { type, id, data } = transformer(chunk, streamStack || { id: '' });

      controller.enqueue(`id: ${id}\n`);
      controller.enqueue(`event: ${type}\n`);
      controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    },
  });

export function createCallbacksTransformer(cb: ChatStreamCallbacks | undefined) {
  const textEncoder = new TextEncoder();
  let aggregatedResponse = '';
  let currentType = '';
  const callbacks = cb || {};

  return new TransformStream({
    async flush(): Promise<void> {
      if (callbacks.onCompletion) {
        await callbacks.onCompletion(aggregatedResponse);
      }

      if (callbacks.onFinal) {
        await callbacks.onFinal(aggregatedResponse);
      }
    },

    async start(): Promise<void> {
      if (callbacks.onStart) await callbacks.onStart();
    },

    async transform(chunk: string, controller): Promise<void> {
      controller.enqueue(textEncoder.encode(chunk));

      // track the type of the chunk
      if (chunk.startsWith('event:')) {
        currentType = chunk.split('event:')[1].trim();
      }
      // if the message is a data chunk, handle the callback
      else if (chunk.startsWith('data:')) {
        const content = chunk.split('data:')[1].trim();

        switch (currentType) {
          case 'text': {
            await callbacks.onText?.(content);
            await callbacks.onToken?.(JSON.parse(content));
            break;
          }

          case 'tool_calls': {
            // TODO: make on ToolCall callback
            await callbacks.onToolCall?.();
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
