import { EnhancedGenerateContentResponse } from '@google/generative-ai';

import { ModelTokensUsage } from '@/types/message';
import { nanoid } from '@/utils/uuid';

import { GoogleAIStreamOptions } from './google-ai';
import {
  StreamContext,
  StreamProtocolChunk,
  StreamToolCallChunkData,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  createTokenSpeedCalculator,
  generateToolCallId,
} from './protocol';

const transformVertexAIStream = (
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
  const candidates = chunk.candidates;

  const text = chunk.text?.();

  if (!candidates)
    return {
      data: '',
      id: context?.id,
      type: 'text',
    };

  const item = candidates[0];
  if (item.content) {
    const part = item.content.parts[0];

    if (item.finishReason) {
      if (chunk.usageMetadata) {
        const usage = chunk.usageMetadata;
        return [
          !!text ? { data: text, id: context?.id, type: 'text' } : undefined,
          { data: item.finishReason, id: context?.id, type: 'stop' },
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
    .pipeThrough(
      createTokenSpeedCalculator(transformVertexAIStream, {
        inputStartAt,
        outputThinking: false,
        streamStack,
      }),
    )
    .pipeThrough(createSSEProtocolTransformer((c) => c, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
