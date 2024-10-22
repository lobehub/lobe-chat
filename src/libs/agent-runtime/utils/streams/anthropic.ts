import Anthropic from '@anthropic-ai/sdk';
import type { Stream } from '@anthropic-ai/sdk/streaming';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamProtocolChunk,
  StreamProtocolToolCallChunk,
  StreamStack,
  StreamToolCallChunkData,
  convertIterableToStream,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from './protocol';

export const transformAnthropicStream = (
  chunk: Anthropic.MessageStreamEvent,
  stack: StreamStack,
): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices
  switch (chunk.type) {
    case 'message_start': {
      stack.id = chunk.message.id;
      return { data: chunk.message, id: chunk.message.id, type: 'data' };
    }
    case 'content_block_start': {
      if (chunk.content_block.type === 'tool_use') {
        const toolChunk = chunk.content_block;

        // if toolIndex is not defined, set it to 0
        if (typeof stack.toolIndex === 'undefined') {
          stack.toolIndex = 0;
        }
        // if toolIndex is defined, increment it
        else {
          stack.toolIndex += 1;
        }

        const toolCall: StreamToolCallChunkData = {
          function: {
            arguments: '',
            name: toolChunk.name,
          },
          id: toolChunk.id,
          index: stack.toolIndex,
          type: 'function',
        };

        stack.tool = { id: toolChunk.id, index: stack.toolIndex, name: toolChunk.name };

        return { data: [toolCall], id: stack.id, type: 'tool_calls' };
      }

      return { data: chunk.content_block.text, id: stack.id, type: 'data' };
    }

    case 'content_block_delta': {
      switch (chunk.delta.type) {
        case 'text_delta': {
          return { data: chunk.delta.text, id: stack.id, type: 'text' };
        }

        case 'input_json_delta': {
          const delta = chunk.delta.partial_json;

          const toolCall: StreamToolCallChunkData = {
            function: { arguments: delta },
            index: stack.toolIndex || 0,
            type: 'function',
          };

          return {
            data: [toolCall],
            id: stack.id,
            type: 'tool_calls',
          } as StreamProtocolToolCallChunk;
        }

        default: {
          break;
        }
      }
      return { data: chunk, id: stack.id, type: 'data' };
    }

    case 'message_delta': {
      return { data: chunk.delta.stop_reason, id: stack.id, type: 'stop' };
    }

    case 'message_stop': {
      return { data: 'message_stop', id: stack.id, type: 'stop' };
    }

    default: {
      return { data: chunk, id: stack.id, type: 'data' };
    }
  }
};

export const AnthropicStream = (
  stream: Stream<Anthropic.MessageStreamEvent> | ReadableStream,
  callbacks?: ChatStreamCallbacks,
) => {
  const streamStack: StreamStack = { id: '' };

  const readableStream =
    stream instanceof ReadableStream ? stream : convertIterableToStream(stream);

  return readableStream
    .pipeThrough(createSSEProtocolTransformer(transformAnthropicStream, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
