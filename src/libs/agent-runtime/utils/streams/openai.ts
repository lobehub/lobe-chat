import { createCallbacksTransformer } from 'ai';
import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

import { ChatStreamCallbacks } from '../../types';
import { transformOpenAIStream } from './protocol';

export const OpenAIStream = (
  stream: Stream<OpenAI.ChatCompletionChunk>,
  callbacks?: ChatStreamCallbacks,
) => {
  return stream
    .toReadableStream()
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
