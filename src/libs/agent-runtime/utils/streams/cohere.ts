import { CohereClient, CohereError, CohereTimeoutError } from 'cohere-ai';
import { ClientOptions } from 'openai';
import { readableFromAsyncIterable } from 'ai';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamProtocolChunk,
  StreamProtocolToolCallChunk,
  StreamStack,
  StreamToolCallChunkData,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from './protocol';

// Define the structure of Cohere's streaming events (pseudo-code, update as per actual structure)
interface CohereMessageStreamEvent {
  type: string;
  delta?: { type: string; text?: string; tool_use?: any; };
  message?: { id: string; };
  stop_reason?: string;
}

// Transform Cohere's stream event to protocol chunk
export const transformCohereStream = (
  chunk: CohereMessageStreamEvent,
  stack: StreamStack,
): StreamProtocolChunk => {
  switch (chunk.type) {
    case 'message_start': {
      stack.id = chunk.message?.id || '';
      return { data: chunk.message, id: chunk.message?.id || '', type: 'data' };
    }

    case 'content_block_delta': {
      switch (chunk.delta?.type) {
        default:
        case 'text_delta': {
          return { data: chunk.delta.text, id: stack.id, type: 'text' };
        }

        case 'tool_use': {
          const delta = chunk.delta.tool_use;

          const toolCall: StreamToolCallChunkData = {
            function: { arguments: JSON.stringify(delta.input), name: delta.name },
            id: delta.id,
            index: 0,
            type: 'function',
          };

          return {
            data: [toolCall],
            id: stack.id,
            type: 'tool_calls',
          } as StreamProtocolToolCallChunk;
        }
      }
    }

    case 'message_delta': {
      return { data: chunk.stop_reason, id: stack.id, type: 'stop' };
    }

    case 'message_stop': {
      return { data: 'message_stop', id: stack.id, type: 'stop' };
    }

    default: {
      return { data: chunk, id: stack.id, type: 'data' };
    }
  }
};

// Async generator to handle Cohere's streaming response
const chatStreamable = async function* (stream: AsyncIterable<CohereMessageStreamEvent>) {
  for await (const response of stream) {
    yield response;
  }
};

// Create the Cohere stream function
export const CohereStream = (
  stream: AsyncIterable<CohereMessageStreamEvent> | ReadableStream,
  callbacks?: ChatStreamCallbacks,
) => {
  const streamStack: StreamStack = { id: '' };

  const readableStream =
    stream instanceof ReadableStream ? stream : readableFromAsyncIterable(chatStreamable(stream));

  return readableStream
    .pipeThrough(createSSEProtocolTransformer(transformCohereStream, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
