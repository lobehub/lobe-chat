import { ChatResponse } from 'ollama/browser';

import { ChatStreamCallbacks } from '@/libs/model-runtime';
import { nanoid } from '@/utils/uuid';

import {
  StreamContext,
  StreamProtocolChunk,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
  generateToolCallId,
} from './protocol';

const transformOllamaStream = (chunk: ChatResponse, stack: StreamContext): StreamProtocolChunk => {
  // maybe need another structure to add support for multiple choices
  if (chunk.done && !chunk.message.content) {
    return { data: 'finished', id: stack.id, type: 'stop' };
  }

  if (chunk.message.thinking) {
    return { data: chunk.message.thinking, id: stack.id, type: 'reasoning' };
  }

  if (chunk.message.tool_calls && chunk.message.tool_calls.length > 0) {
    return {
      data: chunk.message.tool_calls.map((value, index) => ({
        function: {
          arguments: JSON.stringify(value.function?.arguments) ?? '{}',
          name: value.function?.name ?? null,
        },
        id: generateToolCallId(index, value.function?.name),
        index: index,
        type: 'function',
      })),
      id: stack.id,
      type: 'tool_calls',
    };
  }

  // 判断是否有 <think> 或 </think> 标签，更新 thinkingInContent 状态
  if (chunk.message.content.includes('<think>')) {
    stack.thinkingInContent = true;
  } else if (chunk.message.content.includes('</think>')) {
    stack.thinkingInContent = false;
  }

  // 清除 <think> 及 </think> 标签，并根据当前思考模式确定返回类型
  return {
    data: chunk.message.content.replaceAll(/<\/?think>/g, ''),
    id: stack.id,
    type: stack?.thinkingInContent ? 'reasoning' : 'text',
  };
};

export const OllamaStream = (
  res: ReadableStream<ChatResponse>,
  cb?: ChatStreamCallbacks,
): ReadableStream<string> => {
  const streamStack: StreamContext = { id: 'chat_' + nanoid() };

  return res
    .pipeThrough(createSSEProtocolTransformer(transformOllamaStream, streamStack))
    .pipeThrough(createCallbacksTransformer(cb));
};
