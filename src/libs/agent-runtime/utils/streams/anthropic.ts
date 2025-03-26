import Anthropic from '@anthropic-ai/sdk';
import type { Stream } from '@anthropic-ai/sdk/streaming';

import { ModelTokensUsage } from '@/types/message';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamContext,
  StreamProtocolChunk,
  StreamProtocolToolCallChunk,
  StreamToolCallChunkData,
  convertIterableToStream,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from './protocol';

export const transformAnthropicStream = (
  chunk: Anthropic.MessageStreamEvent,
  context: StreamContext,
): StreamProtocolChunk | StreamProtocolChunk[] => {
  // maybe need another structure to add support for multiple choices
  switch (chunk.type) {
    case 'message_start': {
      context.id = chunk.message.id;
      let totalInputTokens = chunk.message.usage?.input_tokens;

      if (
        chunk.message.usage?.cache_creation_input_tokens ||
        chunk.message.usage?.cache_read_input_tokens
      ) {
        totalInputTokens =
          chunk.message.usage?.input_tokens +
          (chunk.message.usage.cache_creation_input_tokens || 0) +
          (chunk.message.usage.cache_read_input_tokens || 0);
      }

      context.usage = {
        inputCacheMissTokens: chunk.message.usage?.input_tokens,
        inputCachedTokens: chunk.message.usage?.cache_read_input_tokens || undefined,
        inputWriteCacheTokens: chunk.message.usage?.cache_creation_input_tokens || undefined,
        totalInputTokens,
        totalOutputTokens: chunk.message.usage?.output_tokens,
      };

      return { data: chunk.message, id: chunk.message.id, type: 'data' };
    }
    case 'content_block_start': {
      switch (chunk.content_block.type) {
        case 'redacted_thinking': {
          return {
            data: chunk.content_block.data,
            id: context.id,
            type: 'flagged_reasoning_signature',
          };
        }

        case 'text': {
          return { data: chunk.content_block.text, id: context.id, type: 'data' };
        }

        case 'tool_use': {
          const toolChunk = chunk.content_block;

          // if toolIndex is not defined, set it to 0
          if (typeof context.toolIndex === 'undefined') {
            context.toolIndex = 0;
          }
          // if toolIndex is defined, increment it
          else {
            context.toolIndex += 1;
          }

          const toolCall: StreamToolCallChunkData = {
            function: {
              arguments: '',
              name: toolChunk.name,
            },
            id: toolChunk.id,
            index: context.toolIndex,
            type: 'function',
          };

          context.tool = { id: toolChunk.id, index: context.toolIndex, name: toolChunk.name };

          return { data: [toolCall], id: context.id, type: 'tool_calls' };
        }
        case 'thinking': {
          const thinkingChunk = chunk.content_block;

          // if there is signature in the thinking block, return both thinking and signature
          if (!!thinkingChunk.signature) {
            return [
              { data: thinkingChunk.thinking, id: context.id, type: 'reasoning' },
              { data: thinkingChunk.signature, id: context.id, type: 'reasoning_signature' },
            ];
          }

          if (typeof thinkingChunk.thinking === 'string')
            return { data: thinkingChunk.thinking, id: context.id, type: 'reasoning' };

          return { data: thinkingChunk, id: context.id, type: 'data' };
        }

        default: {
          break;
        }
      }

      return { data: chunk, id: context.id, type: 'data' };
    }

    case 'content_block_delta': {
      switch (chunk.delta.type) {
        case 'text_delta': {
          return { data: chunk.delta.text, id: context.id, type: 'text' };
        }

        case 'input_json_delta': {
          const delta = chunk.delta.partial_json;

          const toolCall: StreamToolCallChunkData = {
            function: { arguments: delta },
            index: context.toolIndex || 0,
            type: 'function',
          };

          return {
            data: [toolCall],
            id: context.id,
            type: 'tool_calls',
          } as StreamProtocolToolCallChunk;
        }

        case 'signature_delta': {
          return {
            data: chunk.delta.signature,
            id: context.id,
            type: 'reasoning_signature',
          };
        }

        case 'thinking_delta': {
          return {
            data: chunk.delta.thinking,
            id: context.id,
            type: 'reasoning',
          };
        }

        default: {
          break;
        }
      }
      return { data: chunk, id: context.id, type: 'data' };
    }

    case 'message_delta': {
      const totalOutputTokens =
        chunk.usage?.output_tokens + (context.usage?.totalOutputTokens || 0);
      const totalInputTokens = context.usage?.totalInputTokens || 0;
      const totalTokens = totalInputTokens + totalOutputTokens;

      if (totalTokens > 0) {
        return [
          { data: chunk.delta.stop_reason, id: context.id, type: 'stop' },
          {
            data: {
              ...context.usage,
              totalInputTokens,
              totalOutputTokens,
              totalTokens,
            } as ModelTokensUsage,
            id: context.id,
            type: 'usage',
          },
        ];
      }
      return { data: chunk.delta.stop_reason, id: context.id, type: 'stop' };
    }

    case 'message_stop': {
      return { data: 'message_stop', id: context.id, type: 'stop' };
    }

    default: {
      return { data: chunk, id: context.id, type: 'data' };
    }
  }
};

export const AnthropicStream = (
  stream: Stream<Anthropic.MessageStreamEvent> | ReadableStream,
  callbacks?: ChatStreamCallbacks,
) => {
  const streamStack: StreamContext = { id: '' };

  const readableStream =
    stream instanceof ReadableStream ? stream : convertIterableToStream(stream);

  return readableStream
    .pipeThrough(createSSEProtocolTransformer(transformAnthropicStream, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
