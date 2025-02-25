import Anthropic from '@anthropic-ai/sdk';
import type { Stream } from '@anthropic-ai/sdk/streaming';

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
): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices
  switch (chunk.type) {
    case 'message_start': {
      context.id = chunk.message.id;
      return { data: chunk.message, id: chunk.message.id, type: 'data' };
    }
    case 'content_block_start': {
      if (chunk.content_block.type === 'tool_use') {
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

      if (chunk.content_block.type === 'thinking') {
        const thinkingChunk = chunk.content_block;

        return {
          data: { content: thinkingChunk.thinking, signature: thinkingChunk.signature },
          id: context.id,
          type: 'reasoning',
        };
      }

      if (chunk.content_block.type === 'redacted_thinking') {
        return {
          data: { signature: chunk.content_block.data },
          id: context.id,
          type: 'reasoning',
        };
      }

      return { data: chunk.content_block.text, id: context.id, type: 'data' };
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
            data: { signature: chunk.delta.signature },
            id: context.id,
            type: 'reasoning',
          };
        }

        case 'thinking_delta': {
          return {
            data: { content: chunk.delta.thinking },
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
