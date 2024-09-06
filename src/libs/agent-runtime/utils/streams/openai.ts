import { readableFromAsyncIterable } from 'ai';
import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

import { ChatMessageError } from '@/types/message';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamProtocolChunk,
  StreamProtocolToolCallChunk,
  StreamToolCallChunkData,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  generateToolCallId,
} from './protocol';

export const transformOpenAIStream = (chunk: OpenAI.ChatCompletionChunk): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices

  try {
    const item = chunk.choices[0];
    if (!item) {
      return { data: chunk, id: chunk.id, type: 'data' };
    }

    if (typeof item.delta?.content === 'string') {
      return { data: item.delta.content, id: chunk.id, type: 'text' };
    }

    if (item.delta?.tool_calls) {
      return {
        data: item.delta.tool_calls.map(
          (value, index): StreamToolCallChunkData => ({
            function: value.function,
            id: value.id || generateToolCallId(index, value.function?.name),

            // mistral's tool calling don't have index and function field, it's data like:
            // [{"id":"xbhnmTtY7","function":{"name":"lobe-image-designer____text2image____builtin","arguments":"{\"prompts\": [\"A photo of a small, fluffy dog with a playful expression and wagging tail.\", \"A watercolor painting of a small, energetic dog with a glossy coat and bright eyes.\", \"A vector illustration of a small, adorable dog with a short snout and perky ears.\", \"A drawing of a small, scruffy dog with a mischievous grin and a wagging tail.\"], \"quality\": \"standard\", \"seeds\": [123456, 654321, 111222, 333444], \"size\": \"1024x1024\", \"style\": \"vivid\"}"}}]

            // minimax's tool calling don't have index field, it's data like:
            // [{"id":"call_function_4752059746","type":"function","function":{"name":"lobe-image-designer____text2image____builtin","arguments":"{\"prompts\": [\"一个流浪的地球，背景是浩瀚"}}]

            // so we need to add these default values
            index: typeof value.index !== 'undefined' ? value.index : index,
            type: value.type || 'function',
          }),
        ),
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
  } catch (e) {
    const errorName = 'StreamChunkError';
    console.error(`[${errorName}]`, e);
    console.error(`[${errorName}] raw chunk:`, chunk);

    const err = e as Error;

    /* eslint-disable sort-keys-fix/sort-keys-fix */
    const errorData = {
      body: {
        message:
          'chat response streaming chunk parse error, please contact your API Provider to fix it.',
        context: { error: { message: err.message, name: err.name }, chunk },
      },
      type: 'StreamChunkError',
    } as ChatMessageError;
    /* eslint-enable */

    return { data: errorData, id: chunk.id, type: 'error' };
  }
};

const chatStreamable = async function* (stream: AsyncIterable<OpenAI.ChatCompletionChunk>) {
  for await (const response of stream) {
    yield response;
  }
};

export const OpenAIStream = (
  stream: Stream<OpenAI.ChatCompletionChunk> | ReadableStream,
  callbacks?: ChatStreamCallbacks,
) => {
  const readableStream =
    stream instanceof ReadableStream ? stream : readableFromAsyncIterable(chatStreamable(stream));

  return readableStream
    .pipeThrough(createSSEProtocolTransformer(transformOpenAIStream))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
