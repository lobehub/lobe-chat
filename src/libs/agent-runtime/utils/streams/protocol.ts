import { ChatStreamCallbacks } from '@/libs/agent-runtime';

export interface StreamStack {
  id: string;
}

export interface StreamProtocolChunk {
  data: any;
  id?: string;
  type: 'text' | 'tool_calls' | 'data' | 'stop';
}

export interface StreamToolCallChunkData {
  function?: {
    arguments?: string;
    name?: string | null;
  };
  id: string;
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

export const chatStreamable = async function* <T>(stream: AsyncIterable<T>) {
  for await (const response of stream) {
    yield response;
  }
};

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
