import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

import { ChatMessageError } from '@/types/message';

import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../../error';
import { ChatStreamCallbacks } from '../../types';
import {
  FIRST_CHUNK_ERROR_KEY,
  StreamProtocolChunk,
  StreamProtocolToolCallChunk,
  StreamStack,
  StreamToolCallChunkData,
  convertIterableToStream,
  createCallbacksTransformer,
  createFirstErrorHandleTransformer,
  createSSEProtocolTransformer,
  generateToolCallId,
} from './protocol';

export const transformOpenAIStream = (
  chunk: OpenAI.ChatCompletionChunk,
  stack?: StreamStack,
): StreamProtocolChunk => {
  // handle the first chunk error
  if (FIRST_CHUNK_ERROR_KEY in chunk) {
    delete chunk[FIRST_CHUNK_ERROR_KEY];
    // @ts-ignore
    delete chunk['name'];
    // @ts-ignore
    delete chunk['stack'];

    const errorData = {
      body: chunk,
      type: 'errorType' in chunk ? chunk.errorType : AgentRuntimeErrorType.ProviderBizError,
    } as ChatMessageError;
    return { data: errorData, id: 'first_chunk_error', type: 'error' };
  }

  // maybe need another structure to add support for multiple choices

  try {
    const item = chunk.choices[0];
    if (!item) {
      return { data: chunk, id: chunk.id, type: 'data' };
    }

    // tools calling
    if (typeof item.delta?.tool_calls === 'object' && item.delta.tool_calls?.length > 0) {
      return {
        data: item.delta.tool_calls.map((value, index): StreamToolCallChunkData => {
          if (stack && !stack.tool) {
            stack.tool = { id: value.id!, index: value.index, name: value.function!.name! };
          }

          return {
            function: {
              arguments: value.function?.arguments ?? '{}',
              name: value.function?.name ?? null,
            },
            id: value.id || stack?.tool?.id || generateToolCallId(index, value.function?.name),

            // mistral's tool calling don't have index and function field, it's data like:
            // [{"id":"xbhnmTtY7","function":{"name":"lobe-image-designer____text2image____builtin","arguments":"{\"prompts\": [\"A photo of a small, fluffy dog with a playful expression and wagging tail.\", \"A watercolor painting of a small, energetic dog with a glossy coat and bright eyes.\", \"A vector illustration of a small, adorable dog with a short snout and perky ears.\", \"A drawing of a small, scruffy dog with a mischievous grin and a wagging tail.\"], \"quality\": \"standard\", \"seeds\": [123456, 654321, 111222, 333444], \"size\": \"1024x1024\", \"style\": \"vivid\"}"}}]

            // minimax's tool calling don't have index field, it's data like:
            // [{"id":"call_function_4752059746","type":"function","function":{"name":"lobe-image-designer____text2image____builtin","arguments":"{\"prompts\": [\"一个流浪的地球，背景是浩瀚"}}]

            // so we need to add these default values
            index: typeof value.index !== 'undefined' ? value.index : index,
            type: value.type || 'function',
          };
        }),
        id: chunk.id,
        type: 'tool_calls',
      } as StreamProtocolToolCallChunk;
    }

    // 给定结束原因
    if (item.finish_reason) {
      // one-api 的流式接口，会出现既有 finish_reason ，也有 content 的情况
      //  {"id":"demo","model":"deepl-en","choices":[{"index":0,"delta":{"role":"assistant","content":"Introduce yourself."},"finish_reason":"stop"}]}

      if (typeof item.delta?.content === 'string' && !!item.delta.content) {
        return { data: item.delta.content, id: chunk.id, type: 'text' };
      }

      return { data: item.finish_reason, id: chunk.id, type: 'stop' };
    }

    if (typeof item.delta?.content === 'string') {
      return { data: item.delta.content, id: chunk.id, type: 'text' };
    }

    // 无内容情况
    if (item.delta && item.delta.content === null) {
      // deepseek reasoner 会将 thinking 放在 reasoning_content 字段中
      if ('reasoning_content' in item.delta && typeof item.delta.reasoning_content === 'string') {
        return { data: item.delta.reasoning_content, id: chunk.id, type: 'reasoning' };
      }

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
      type: errorName,
    } as ChatMessageError;
    /* eslint-enable */

    return { data: errorData, id: chunk.id, type: 'error' };
  }
};

export interface OpenAIStreamOptions {
  bizErrorTypeTransformer?: (error: {
    message: string;
    name: string;
  }) => ILobeAgentRuntimeErrorType | undefined;
  callbacks?: ChatStreamCallbacks;
  provider?: string;
}

export const OpenAIStream = (
  stream: Stream<OpenAI.ChatCompletionChunk> | ReadableStream,
  { callbacks, provider, bizErrorTypeTransformer }: OpenAIStreamOptions = {},
) => {
  const streamStack: StreamStack = { id: '' };

  const readableStream =
    stream instanceof ReadableStream ? stream : convertIterableToStream(stream);

  return (
    readableStream
      // 1. handle the first error if exist
      // provider like huggingface or minimax will return error in the stream,
      // so in the first Transformer, we need to handle the error
      .pipeThrough(createFirstErrorHandleTransformer(bizErrorTypeTransformer, provider))
      .pipeThrough(createSSEProtocolTransformer(transformOpenAIStream, streamStack))
      .pipeThrough(createCallbacksTransformer(callbacks))
  );
};
