import { EnhancedGenerateContentResponse, GenerateContentResponse } from '@google/generative-ai';

import { ModelTokensUsage } from '@/types/message';
import { nanoid } from '@/utils/uuid';

import { type GoogleAIStreamOptions } from './google-ai';
import {
  StreamContext,
  StreamProtocolChunk,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  createTokenSpeedCalculator,
  generateToolCallId,
} from './protocol';

const transformVertexAIStream = (
  chunk: GenerateContentResponse,
  context: StreamContext,
): StreamProtocolChunk | StreamProtocolChunk[] => {
  // maybe need another structure to add support for multiple choices
  const candidate = chunk.candidates?.[0];
  const usage = chunk.usageMetadata;
  const usageChunks: StreamProtocolChunk[] = [];
  if (candidate?.finishReason && usage) {
    const outputReasoningTokens = (usage as any).thoughtsTokenCount || undefined;
    const totalOutputTokens = (usage.candidatesTokenCount ?? 0) + (outputReasoningTokens ?? 0);

    usageChunks.push(
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
          outputReasoningTokens,
          outputTextTokens: totalOutputTokens - (outputReasoningTokens ?? 0),
          totalInputTokens: usage.promptTokenCount,
          totalOutputTokens,
          totalTokens: usage.totalTokenCount,
        } as ModelTokensUsage,
        id: context?.id,
        type: 'usage',
      },
    );
  }

  if (
    candidate && // 首先检查是否为 reasoning 内容 (thought: true)
    Array.isArray(candidate.content.parts) &&
    candidate.content.parts.length > 0
  ) {
    for (const part of candidate.content.parts) {
      if (part && part.text && (part as any).thought === true) {
        return { data: part.text, id: context.id, type: 'reasoning' };
      }
    }
  }

  const candidates = chunk.candidates;
  if (!candidates)
    return {
      data: '',
      id: context?.id,
      type: 'text',
    };

  const item = candidates[0];
  if (item.content) {
    const part = item.content.parts[0];

    if (part.functionCall) {
      const functionCall = part.functionCall;

      return [
        {
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
          id: context?.id,
          type: 'tool_calls',
        },
        ...usageChunks,
      ];
    }

    if (item.finishReason) {
      if (chunk.usageMetadata) {
        return [
          !!part.text ? { data: part.text, id: context?.id, type: 'text' } : undefined,
          ...usageChunks,
        ].filter(Boolean) as StreamProtocolChunk[];
      }
      return { data: item.finishReason, id: context?.id, type: 'stop' };
    }

    return {
      data: part.text,
      id: context?.id,
      type: 'text',
    };
  }

  return {
    data: '',
    id: context?.id,
    type: 'stop',
  };
};

export const VertexAIStream = (
  rawStream: ReadableStream<EnhancedGenerateContentResponse>,
  { callbacks, inputStartAt }: GoogleAIStreamOptions = {},
) => {
  const streamStack: StreamContext = { id: 'chat_' + nanoid() };

  return rawStream
    .pipeThrough(createTokenSpeedCalculator(transformVertexAIStream, { inputStartAt, streamStack }))
    .pipeThrough(createSSEProtocolTransformer((c) => c, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
