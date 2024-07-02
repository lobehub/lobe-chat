import { CohereClient } from 'cohere-ai';
import { readableFromAsyncIterable } from 'ai';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamProtocolChunk,
  StreamStack,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from './protocol';

type CohereStreamEvent = Awaited<ReturnType<CohereClient["chatStream"]>> extends AsyncIterable<infer T> ? T : never;

const transformCohereStream = (
  chunk: CohereStreamEvent,
  stack: StreamStack
): StreamProtocolChunk => {
  if (typeof chunk === 'object' && chunk !== null) {
    if ('text' in chunk) {
      return { data: chunk.text, id: stack.id, type: 'text' };
    } else if ('finish_reason' in chunk) {
      return { data: chunk.finish_reason, id: stack.id, type: 'stop' };
    }
  }
  return { data: chunk, id: stack.id, type: 'data' };
};

const chatStreamable = async function* (stream: AsyncIterable<CohereStreamEvent>) {
  for await (const response of stream) {
    yield response;
  }
};


export const CohereStream = (
  stream: AsyncIterable<CohereStreamEvent>,
  callbacks?: ChatStreamCallbacks
) => {
  const streamStack: StreamStack = { id: '' };

  const readableStream =
    stream instanceof ReadableStream ? stream : readableFromAsyncIterable(chatStreamable(stream));

  return readableStream
    .pipeThrough(createSSEProtocolTransformer(transformCohereStream, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
