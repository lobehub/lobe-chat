import { createCallbacksTransformer, readableFromAsyncIterable } from 'ai';
import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

import { ChatStreamCallbacks } from '../../types';
import { transformOpenAIStream } from './protocol';

const chatStreamable = async function* (stream: AsyncIterable<OpenAI.ChatCompletionChunk>) {
  for await (const response of stream) {
    yield response;
  }
};

export const OpenAIStream = (
  stream: Stream<OpenAI.ChatCompletionChunk> | ReadableStream,
  callbacks?: ChatStreamCallbacks,
) => {
  const readableStream =
    stream instanceof ReadableStream ? stream : readableFromAsyncIterable(chatStreamable(stream));

  return readableStream
    .pipeThrough(
      new TransformStream({
        transform: (chunk, controller) => {
          const { type, id, data } = transformOpenAIStream(chunk);

          controller.enqueue(`id: ${id}\n`);
          controller.enqueue(`event: ${type}\n`);
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        },
      }),
    )
    .pipeThrough(createCallbacksTransformer(callbacks));
};
