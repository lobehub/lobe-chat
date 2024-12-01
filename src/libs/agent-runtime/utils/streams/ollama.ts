import { ChatResponse } from 'ollama/browser';

import { ChatStreamCallbacks } from '@/libs/agent-runtime';
import { nanoid } from '@/utils/uuid';

import {
  StreamProtocolChunk,
  StreamStack,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  generateToolCallId,
} from './protocol';

const transformOllamaStream = (chunk: ChatResponse, stack: StreamStack): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices
  if (chunk.done && !chunk.message.content) {
    return { data: 'finished', id: stack.id, type: 'stop' };
  }

  if (chunk.message.tool_calls && chunk.message.tool_calls.length > 0) {
    return {
      data: chunk.message.tool_calls.map((value, index) => ({
        function: {
          arguments: JSON.stringify(value.function?.arguments) ?? '{}',
          name: value.function?.name ?? null,
        },
        id: generateToolCallId(index, value.function?.name),
        index: index,
        type: 'function',
      })),
      id: stack.id,
      type: 'tool_calls',
    };
  }
  return { data: chunk.message.content, id: stack.id, type: 'text' };
};

export const OllamaStream = (
  res: ReadableStream<ChatResponse>,
  cb?: ChatStreamCallbacks,
): ReadableStream<string> => {
  const streamStack: StreamStack = { id: 'chat_' + nanoid() };

  return res
    .pipeThrough(createSSEProtocolTransformer(transformOllamaStream, streamStack))
    .pipeThrough(createCallbacksTransformer(cb));
};
