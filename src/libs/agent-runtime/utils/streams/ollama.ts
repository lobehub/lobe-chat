import { ChatResponse } from 'ollama/browser';

import { ChatStreamCallbacks } from '@/libs/agent-runtime';
import { nanoid } from '@/utils/uuid';

import {
  StreamProtocolChunk,
  StreamStack,
  convertIterableToStream,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from './protocol';

const transformOllamaStream = (chunk: ChatResponse, stack: StreamStack): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices
  if (chunk.done) {
    return { data: 'finished', id: stack.id, type: 'stop' };
  }

  return { data: chunk.message.content, id: stack.id, type: 'text' };
};

export const OllamaStream = (
  res: AsyncIterable<ChatResponse>,
  cb?: ChatStreamCallbacks,
): ReadableStream<string> => {
  const streamStack: StreamStack = { id: 'chat_' + nanoid() };

  return convertIterableToStream(res)
    .pipeThrough(createSSEProtocolTransformer(transformOllamaStream, streamStack))
    .pipeThrough(createCallbacksTransformer(cb));
};
