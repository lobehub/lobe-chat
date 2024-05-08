import { createCallbacksTransformer } from 'ai';
import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

import { ChatStreamCallbacks } from '../../types';
import { transformOpenAIStream } from './protocol';

export const OpenAIStream = (
  stream: Stream<OpenAI.ChatCompletionChunk> | ReadableStream,
  callbacks?: ChatStreamCallbacks,
) => {
  const readableStream = stream instanceof ReadableStream ? stream : stream.toReadableStream();

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
