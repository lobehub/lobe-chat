import { readableFromAsyncIterable } from 'ai';
import { ChatResponse } from 'ollama/browser';

import { ChatStreamCallbacks } from '@/libs/agent-runtime';
import { nanoid } from '@/utils/uuid';

import {
  StreamProtocolChunk,
  StreamStack,
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

const chatStreamable = async function* (stream: AsyncIterable<ChatResponse>) {
  for await (const response of stream) {
    yield response;
  }
};

export const OllamaStream = (
  res: AsyncIterable<ChatResponse>,
  cb?: ChatStreamCallbacks,
): ReadableStream<string> => {
  const streamStack: StreamStack = { id: 'chat_' + nanoid() };

  return readableFromAsyncIterable(chatStreamable(res))
    .pipeThrough(createSSEProtocolTransformer(transformOllamaStream, streamStack))
    .pipeThrough(createCallbacksTransformer(cb));
};
