// copy from https://github.com/vercel/ai/discussions/539#discussioncomment-8193721
// and I have remove the unnecessary code
import {
  type AIStreamCallbacksAndOptions,
  createCallbacksTransformer,
  readableFromAsyncIterable,
} from 'ai';
import { ChatResponse } from 'ollama/browser';

import { nanoid } from '@/utils/uuid';

import { StreamProtocolChunk, StreamStack } from './protocol';

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
  cb?: AIStreamCallbacksAndOptions,
): ReadableStream<string> => {
  const streamStack: StreamStack = { id: 'chat_' + nanoid() };

  return readableFromAsyncIterable(chatStreamable(res))
    .pipeThrough(
      new TransformStream({
        transform: (chunk, controller) => {
          const { type, id, data } = transformOllamaStream(chunk, streamStack);

          controller.enqueue(`id: ${id}\n`);
          controller.enqueue(`event: ${type}\n`);
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        },
      }),
    )
    .pipeThrough(createCallbacksTransformer(cb) as any);
};
