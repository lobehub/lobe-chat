import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamProtocolChunk,
  StreamProtocolToolCallChunk,
  convertIterableToStream,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  generateToolCallId,
} from './protocol';

export function transformSparkResponseToStream(data: OpenAI.ChatCompletion) {
  return new ReadableStream({
    start(controller) {
      const chunk: OpenAI.ChatCompletionChunk = {
        choices: data.choices.map((choice: OpenAI.ChatCompletion.Choice) => {
          const toolCallsArray = choice.message.tool_calls
            ? Array.isArray(choice.message.tool_calls)
              ? choice.message.tool_calls
              : [choice.message.tool_calls]
            : []; // 如果不是数组，包装成数组

          return {
            delta: {
              content: choice.message.content,
              role: choice.message.role,
              tool_calls: toolCallsArray.map(
                (tool, index): OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall => ({
                  function: tool.function,
                  id: tool.id,
                  index,
                  type: tool.type,
                }),
              ),
            },
            finish_reason: null,
            index: choice.index,
            logprobs: choice.logprobs,
          };
        }),
        created: data.created,
        id: data.id,
        model: data.model,
        object: 'chat.completion.chunk',
      };

      controller.enqueue(chunk);

      controller.enqueue({
        choices: data.choices.map((choice: OpenAI.ChatCompletion.Choice) => ({
          delta: {
            content: null,
            role: choice.message.role,
          },
          finish_reason: choice.finish_reason,
          index: choice.index,
          logprobs: choice.logprobs,
        })),
        created: data.created,
        id: data.id,
        model: data.model,
        object: 'chat.completion.chunk',
        system_fingerprint: data.system_fingerprint,
      } as OpenAI.ChatCompletionChunk);
      controller.close();
    },
  });
}

export const transformSparkStream = (chunk: OpenAI.ChatCompletionChunk): StreamProtocolChunk => {
  const item = chunk.choices[0];

  if (!item) {
    return { data: chunk, id: chunk.id, type: 'data' };
  }

  if (item.delta?.tool_calls) {
    const toolCallsArray = Array.isArray(item.delta.tool_calls)
      ? item.delta.tool_calls
      : [item.delta.tool_calls]; // 如果不是数组，包装成数组

    if (toolCallsArray.length > 0) {
      return {
        data: toolCallsArray.map((toolCall, index) => ({
          function: toolCall.function,
          id: toolCall.id || generateToolCallId(index, toolCall.function?.name),
          index: typeof toolCall.index !== 'undefined' ? toolCall.index : index,
          type: toolCall.type || 'function',
        })),
        id: chunk.id,
        type: 'tool_calls',
      } as StreamProtocolToolCallChunk;
    }
  }

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

  if (item.delta?.content === null) {
    return { data: item.delta, id: chunk.id, type: 'data' };
  }

  return {
    data: { delta: item.delta, id: chunk.id, index: item.index },
    id: chunk.id,
    type: 'data',
  };
};

export const SparkAIStream = (
  stream: Stream<OpenAI.ChatCompletionChunk> | ReadableStream,
  // TODO: preserve for RFC 097
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  { callbacks, inputStartAt }: { callbacks?: ChatStreamCallbacks; inputStartAt?: number } = {},
) => {
  const readableStream =
    stream instanceof ReadableStream ? stream : convertIterableToStream(stream);

  return readableStream
    .pipeThrough(createSSEProtocolTransformer(transformSparkStream))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
