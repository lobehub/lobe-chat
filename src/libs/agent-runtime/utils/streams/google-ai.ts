import { EnhancedGenerateContentResponse } from '@google/generative-ai';

import { GroundingSearch } from '@/types/search';
import { nanoid } from '@/utils/uuid';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamContext,
  StreamProtocolChunk,
  StreamToolCallChunkData,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  generateToolCallId,
} from './protocol';

const transformGoogleGenerativeAIStream = (
  chunk: EnhancedGenerateContentResponse,
  context: StreamContext,
): StreamProtocolChunk | StreamProtocolChunk[] => {
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
      id: context.id,
      type: 'tool_calls',
    };
  }
  const text = chunk.text();

  if (chunk.candidates && chunk.candidates[0].groundingMetadata) {
    const { webSearchQueries, groundingSupports, groundingChunks } =
      chunk.candidates[0].groundingMetadata;
    console.log({ groundingChunks, groundingSupports, webSearchQueries });

    return [
      { data: text, id: context.id, type: 'text' },
      {
        data: {
          citations: groundingChunks?.map((chunk) => ({
            // google 返回的 uri 是经过 google 自己处理过的 url，因此无法展现真实的 favicon
            // 需要使用 title 作为替换
            favicon: chunk.web?.title,
            title: chunk.web?.title,
            url: chunk.web?.uri,
          })),
          searchQueries: webSearchQueries,
        } as GroundingSearch,
        id: context.id,
        type: 'grounding',
      },
    ];
  }

  return {
    data: text,
    id: context?.id,
    type: 'text',
  };
};

export const GoogleGenerativeAIStream = (
  rawStream: ReadableStream<EnhancedGenerateContentResponse>,
  callbacks?: ChatStreamCallbacks,
) => {
  const streamStack: StreamContext = { id: 'chat_' + nanoid() };

  return rawStream
    .pipeThrough(createSSEProtocolTransformer(transformGoogleGenerativeAIStream, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
