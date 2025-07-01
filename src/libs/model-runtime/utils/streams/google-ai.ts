import { GenerateContentResponse } from '@google/genai';

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
  createTokenSpeedCalculator,
  generateToolCallId,
} from './protocol';

const transformGoogleGenerativeAIStream = (
  chunk: GenerateContentResponse,
  context: StreamContext,
): StreamProtocolChunk | StreamProtocolChunk[] => {
  // maybe need another structure to add support for multiple choices
  const candidate = chunk.candidates?.[0];
  const usage = chunk.usageMetadata;
  const usageChunks: StreamProtocolChunk[] = [];
  if (candidate?.finishReason && usage) {
    // totalTokenCount = promptTokenCount + candidatesTokenCount + thoughtsTokenCount
    const reasoningTokens = usage.thoughtsTokenCount;
    const outputTextTokens = usage.candidatesTokenCount ?? 0;
    const totalOutputTokens = outputTextTokens + (reasoningTokens ?? 0);

    usageChunks.push(
      { data: candidate.finishReason, id: context?.id, type: 'stop' },
      {
        data: {
          // TODO: Google SDK 0.24.0 don't have promptTokensDetails types
          inputImageTokens: usage.promptTokensDetails?.find((i: any) => i.modality === 'IMAGE')
            ?.tokenCount,
          inputTextTokens: usage.promptTokensDetails?.find((i: any) => i.modality === 'TEXT')
            ?.tokenCount,
          outputReasoningTokens: reasoningTokens,
          outputTextTokens,
          totalInputTokens: usage.promptTokenCount,
          totalOutputTokens,
          totalTokens: usage.totalTokenCount,
        } as ModelTokensUsage,
        id: context?.id,
        type: 'usage',
      },
    );
  }

  const functionCalls = chunk.functionCalls;

  if (functionCalls) {
    return [
      {
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
      },
      ...usageChunks,
    ];
  }

  const text = chunk.text;

  if (candidate) {
    // 首先检查是否为 reasoning 内容 (thought: true)
    if (Array.isArray(candidate.content?.parts) && candidate.content.parts.length > 0) {
      for (const part of candidate.content.parts) {
        if (part && part.text && (part as any).thought === true) {
          return { data: part.text, id: context.id, type: 'reasoning' };
        }
      }
    }

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
        ...usageChunks,
      ];
    }

    if (candidate.finishReason) {
      if (chunk.usageMetadata) {
        return [
          !!text ? { data: text, id: context?.id, type: 'text' } : undefined,
          ...usageChunks,
        ].filter(Boolean) as StreamProtocolChunk[];
      }
      return { data: candidate.finishReason, id: context?.id, type: 'stop' };
    }

    if (!!text?.trim()) return { data: text, id: context?.id, type: 'text' };

    // streaming the image
    if (Array.isArray(candidate.content?.parts) && candidate.content.parts.length > 0) {
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

export interface GoogleAIStreamOptions {
  callbacks?: ChatStreamCallbacks;
  inputStartAt?: number;
}

export const GoogleGenerativeAIStream = (
  rawStream: ReadableStream<GenerateContentResponse>,
  { callbacks, inputStartAt }: GoogleAIStreamOptions = {},
) => {
  const streamStack: StreamContext = { id: 'chat_' + nanoid() };

  return rawStream
    .pipeThrough(
      createTokenSpeedCalculator(transformGoogleGenerativeAIStream, { inputStartAt, streamStack }),
    )
    .pipeThrough(createSSEProtocolTransformer((c) => c, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
