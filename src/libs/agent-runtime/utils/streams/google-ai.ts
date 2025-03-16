import { EnhancedGenerateContentResponse } from '@google/generative-ai';

import { ModelTokensUsage } from '@/types/message';
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
  const functionCalls = chunk.functionCalls?.();

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

  const text = chunk.text?.();

  if (chunk.candidates) {
    const candidate = chunk.candidates[0];

    // return the grounding
    if (candidate.groundingMetadata) {
      const { webSearchQueries, groundingChunks } = candidate.groundingMetadata;

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

    if (candidate.finishReason) {
      if (chunk.usageMetadata) {
        const usage = chunk.usageMetadata;
        return [
          !!text ? { data: text, id: context?.id, type: 'text' } : undefined,
          { data: candidate.finishReason, id: context?.id, type: 'stop' },
          {
            data: {
              // TODO: Google SDK 0.24.0 don't have promptTokensDetails types
              inputImageTokens: (usage as any).promptTokensDetails?.find(
                (i: any) => i.modality === 'IMAGE',
              )?.tokenCount,
              inputTextTokens: (usage as any).promptTokensDetails?.find(
                (i: any) => i.modality === 'TEXT',
              )?.tokenCount,
              totalInputTokens: usage.promptTokenCount,
              totalOutputTokens: usage.candidatesTokenCount,
              totalTokens: usage.totalTokenCount,
            } as ModelTokensUsage,
            id: context?.id,
            type: 'usage',
          },
        ].filter(Boolean) as StreamProtocolChunk[];
      }
      return { data: candidate.finishReason, id: context?.id, type: 'stop' };
    }

    if (!!text?.trim()) return { data: text, id: context?.id, type: 'text' };

    // streaming the image
    if (Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
      const part = candidate.content.parts[0];

      if (part && part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
        return {
          data: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          id: context.id,
          type: 'base64_image',
        };
      }
    }
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
