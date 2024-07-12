import { readableFromAsyncIterable } from 'ai';
import { ChatCompletionContentPartText } from 'ai/prompts';
import OpenAI from 'openai';
import { ChatCompletionContentPart } from 'openai/resources/index.mjs';
import type { Stream } from 'openai/streaming';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamProtocolChunk,
  StreamProtocolToolCallChunk,
  StreamToolCallChunkData,
  chatStreamable,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  generateToolCallId,
} from './protocol';

export const transformQwenStream = (chunk: OpenAI.ChatCompletionChunk): StreamProtocolChunk => {
  const item = chunk.choices[0];

  if (!item) {
    return { data: chunk, id: chunk.id, type: 'data' };
  }

  if (Array.isArray(item.delta?.content)) {
    const part = item.delta.content[0];
    const process = (part: ChatCompletionContentPart): ChatCompletionContentPartText => {
      let [key, value] = Object.entries(part)[0];
      if (key === 'image') {
        return {
          text: `![image](${value})`,
          type: 'text',
        };
      }
      return {
        text: value,
        type: 'text',
      };
    };

    const data = process(part);

    return {
      data: data.text,
      id: chunk.id,
      type: 'text',
    };
  }

  if (item.delta?.tool_calls) {
    return {
      data: item.delta.tool_calls.map(
        (value, index): StreamToolCallChunkData => ({
          function: value.function,
          id: value.id || generateToolCallId(index, value.function?.name),
          index: typeof value.index !== 'undefined' ? value.index : index,
          type: value.type || 'function',
        }),
      ),
      id: chunk.id,
      type: 'tool_calls',
    } as StreamProtocolToolCallChunk;
  }

  if (item.finish_reason) {
    return { data: item.finish_reason, id: chunk.id, type: 'stop' };
  }

  if (typeof item.delta?.content === 'string') {
    return { data: item.delta.content, id: chunk.id, type: 'text' };
  }

  if (item.delta?.content === null) {
    return { data: item.delta, id: chunk.id, type: 'data' };
  }

  return {
    data: { delta: item.delta, id: chunk.id, index: item.index },
    id: chunk.id,
    type: 'data',
  };
};

export const QwenAIStream = (
  stream: Stream<OpenAI.ChatCompletionChunk> | ReadableStream,
  callbacks?: ChatStreamCallbacks,
) => {
  const readableStream =
    stream instanceof ReadableStream ? stream : readableFromAsyncIterable(chatStreamable(stream));

  return readableStream
    .pipeThrough(createSSEProtocolTransformer(transformQwenStream))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
