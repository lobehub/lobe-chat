import { EnhancedGenerateContentResponse, GenerateContentResponse } from '@google/generative-ai';

import { nanoid } from '@/utils/uuid';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamContext,
  StreamProtocolChunk,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  generateToolCallId,
} from './protocol';

const transformVertexAIStream = (
  chunk: GenerateContentResponse,
  stack: StreamContext,
): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices
  const candidates = chunk.candidates;

  if (!candidates)
    return {
      data: '',
      id: stack?.id,
      type: 'text',
    };

  const item = candidates[0];
  if (item.content) {
    const part = item.content.parts[0];

    if (part.functionCall) {
      const functionCall = part.functionCall;

      return {
        data: [
          {
            function: {
              arguments: JSON.stringify(functionCall.args),
              name: functionCall.name,
            },
            id: generateToolCallId(0, functionCall.name),
            index: 0,
            type: 'function',
          },
        ],
        id: stack?.id,
        type: 'tool_calls',
      };
    }

    return {
      data: part.text,
      id: stack?.id,
      type: 'text',
    };
  }

  return {
    data: '',
    id: stack?.id,
    type: 'stop',
  };
};

export const VertexAIStream = (
  rawStream: ReadableStream<EnhancedGenerateContentResponse>,
  callbacks?: ChatStreamCallbacks,
) => {
  const streamStack: StreamContext = { id: 'chat_' + nanoid() };

  return rawStream
    .pipeThrough(createSSEProtocolTransformer(transformVertexAIStream, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
