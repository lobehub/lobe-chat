import OpenAI from 'openai';

import { ChatStreamCallbacks } from '../../types';
import { transformOpenAIStream } from './openai';
import { createCallbacksTransformer, createSSEProtocolTransformer } from './protocol';

export const processDoubleData = (chunkValue: string): string => {
  const dataPattern = /data: {"id":"/g;
  const matchCount = (chunkValue.match(dataPattern) || []).length;
  let modifiedChunkValue = chunkValue;
  if (matchCount === 2) {
    const secondDataIdIndex = chunkValue.indexOf('data: {"id":', chunkValue.indexOf('data: {"id":') + 1);
    if (secondDataIdIndex !== -1) {
      modifiedChunkValue = chunkValue.slice(0, secondDataIdIndex).trim();
    }
  }
  return modifiedChunkValue;
};

const unit8ArrayToJSONChunk = (unit8Array: Uint8Array): OpenAI.ChatCompletionChunk => {
  const decoder = new TextDecoder();

  let chunkValue = decoder.decode(unit8Array, { stream: true });

  // chunkValue example:
  // data: {"id":"028a65377137d57aaceeffddf48ae99f","choices":[{"finish_reason":"tool_calls","index":0,"delta":{"role":"assistant","tool_calls":[{"id":"call_function_7371372822","type":"function","function":{"name":"realtime-weather____fetchCurrentWeather","arguments":"{\"city\": [\"杭州\", \"北京\"]}"}}]}}],"created":155511,"model":"abab6.5s-chat","object":"chat.completion.chunk"}

  chunkValue = processDoubleData(chunkValue);

  // so we need to remove `data:` prefix and then parse it as JSON
  if (chunkValue.startsWith('data:')) {
    chunkValue = chunkValue.slice(5).trim();
  }

  try {
    return JSON.parse(chunkValue);
  } catch (e) {
    console.error('minimax chunk parse error:', e);

    return { raw: chunkValue } as any;
  }
};

export const MinimaxStream = (stream: ReadableStream, callbacks?: ChatStreamCallbacks) => {
  return stream
    .pipeThrough(
      createSSEProtocolTransformer((buffer) => {
        const chunk = unit8ArrayToJSONChunk(buffer);

        return transformOpenAIStream(chunk);
      }),
    )
    .pipeThrough(createCallbacksTransformer(callbacks));
};
