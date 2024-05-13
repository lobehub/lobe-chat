import {
  EnhancedGenerateContentResponse,
  GenerateContentStreamResult,
} from '@google/generative-ai';
import { readableFromAsyncIterable } from 'ai';

import { nanoid } from '@/utils/uuid';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamProtocolChunk,
  StreamStack,
  StreamToolCallChunkData,
  chatStreamable,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  generateToolCallId,
} from './protocol';

const transformGoogleGenerativeAIStream = (
  chunk: EnhancedGenerateContentResponse,
  stack: StreamStack,
): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices
  const functionCalls = chunk.functionCalls();

  if (functionCalls) {
    return {
      data: functionCalls.map(
        (value, index): StreamToolCallChunkData => ({
          function: {
            arguments: JSON.stringify(value.args),
            name: value.name,
          },
          id: generateToolCallId(index, value.name),
          index: index,
          type: 'function',
        }),
      ),
      id: stack.id,
      type: 'tool_calls',
    };
  }
  const text = chunk.text();

  return {
    data: text,
    id: stack?.id,
    type: 'text',
  };
};

// only use for debug
export const googleGenAIResultToStream = (stream: GenerateContentStreamResult) => {
  // make the response to the streamable format
  return readableFromAsyncIterable(chatStreamable(stream.stream));
};

export const GoogleGenerativeAIStream = (
  rawStream: ReadableStream<EnhancedGenerateContentResponse>,
  callbacks?: ChatStreamCallbacks,
) => {
  const streamStack: StreamStack = { id: 'chat_' + nanoid() };

  return rawStream
    .pipeThrough(createSSEProtocolTransformer(transformGoogleGenerativeAIStream, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
