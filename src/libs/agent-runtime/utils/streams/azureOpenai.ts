import OpenAI from 'openai';
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';
import { Stream } from 'openai/streaming';

import { ChatStreamCallbacks } from '../../types';
import { transformResponseToStream } from '../openaiCompatibleFactory';
import {
  StreamProtocolChunk,
  StreamProtocolToolCallChunk,
  StreamStack,
  StreamToolCallChunkData,
  convertIterableToStream,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from './protocol';

const transformOpenAIStream = (
  chunk: ChatCompletionChunk,
  stack: StreamStack,
): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices

  const item = chunk.choices[0];
  if (!item) {
    return { data: chunk, id: chunk.id, type: 'data' };
  }

  if (typeof item.delta?.content === 'string') {
    return { data: item.delta.content, id: chunk.id, type: 'text' };
  }

  if (item.delta?.tool_calls) {
    return {
      data: item.delta.tool_calls.map((value, index): StreamToolCallChunkData => {
        const func = (value as ChatCompletionMessageToolCall).function;

        // at first time, set tool id
        if (!stack.tool) {
          stack.tool = { id: value.id!, index, name: func.name }; // TODO: undefined id
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
  if (item.finish_reason) {
    return { data: item.finish_reason, id: chunk.id, type: 'stop' };
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

export function convertToStream(
  response: Stream<ChatCompletionChunk> | ChatCompletion,
): Stream<ChatCompletionChunk> | ReadableStream<ChatCompletionChunk> {
  if (response instanceof Stream) {
    return response;
  }

  return transformResponseToStream(response);
}
