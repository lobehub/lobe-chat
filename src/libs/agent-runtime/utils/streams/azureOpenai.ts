import { ChatCompletions, ChatCompletionsFunctionToolCall } from '@azure/openai';
import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

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

const transformOpenAIStream = (chunk: ChatCompletions, stack: StreamStack): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices

  const item = chunk.choices[0];
  if (!item) {
    return { data: chunk, id: chunk.id, type: 'data' };
  }

  if (typeof item.delta?.content === 'string') {
    return { data: item.delta.content, id: chunk.id, type: 'text' };
  }

  if (item.delta?.toolCalls) {
    return {
      data: item.delta.toolCalls.map((value, index): StreamToolCallChunkData => {
        const func = (value as ChatCompletionsFunctionToolCall).function;

        // at first time, set tool id
        if (!stack.tool) {
          stack.tool = { id: value.id, index, name: func.name };
        } else {
          // in the parallel tool calling, set the new tool id
          if (value.id && stack.tool.id !== value.id) {
            stack.tool = { id: value.id, index, name: func.name };
          }
        }

        return {
          function: func,
          id: value.id || stack.tool?.id,
          index: value.index || index,
          type: value.type || 'function',
        };
      }),
      id: chunk.id,
      type: 'tool_calls',
    } as StreamProtocolToolCallChunk;
  }

  // 给定结束原因
  if (item.finishReason) {
    return { data: item.finishReason, id: chunk.id, type: 'stop' };
  }

  if (item.delta?.content === null) {
    return { data: item.delta, id: chunk.id, type: 'data' };
  }

  // 其余情况下，返回 delta 和 index
  return {
    data: { delta: item.delta, id: chunk.id, index: item.index },
    id: chunk.id,
    type: 'data',
  };
};

export const AzureOpenAIStream = (
  stream: Stream<OpenAI.ChatCompletionChunk> | ReadableStream,
  callbacks?: ChatStreamCallbacks,
) => {
  const stack: StreamStack = { id: '' };
  const readableStream =
    stream instanceof ReadableStream ? stream : convertIterableToStream(stream);

  return readableStream
    .pipeThrough(createSSEProtocolTransformer(transformOpenAIStream, stack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
