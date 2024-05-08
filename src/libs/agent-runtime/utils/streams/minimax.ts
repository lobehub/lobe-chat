import { createCallbacksTransformer } from 'ai';
import OpenAI from 'openai';

import { ChatStreamCallbacks } from '../../types';
import { transformOpenAIStream } from './protocol';

const unit8ArrayToJSONChunk = (unit8Array: Uint8Array): OpenAI.ChatCompletionChunk => {
  const decoder = new TextDecoder();

  let chunkValue = decoder.decode(unit8Array, { stream: true });

  // chunkValue example:
  // data: {"id":"028a65377137d57aaceeffddf48ae99f","choices":[{"finish_reason":"tool_calls","index":0,"delta":{"role":"assistant","tool_calls":[{"id":"call_function_7371372822","type":"function","function":{"name":"realtime-weather____fetchCurrentWeather","arguments":"{\"city\": [\"杭州\", \"北京\"]}"}}]}}],"created":155511,"model":"abab6.5s-chat","object":"chat.completion.chunk"}

  // so we need to remove `data:` prefix and then parse it as JSON
  if (chunkValue.startsWith('data:')) {
    chunkValue = chunkValue.slice(5).trim();
  }

  return JSON.parse(chunkValue);
};

export const MinimaxStream = (stream: ReadableStream, callbacks?: ChatStreamCallbacks) => {
  return stream
    .pipeThrough(
      new TransformStream({
        transform: (buffer, controller) => {
          const chunk = unit8ArrayToJSONChunk(buffer);

          const { type, id, data } = transformOpenAIStream(chunk);

          controller.enqueue(`id: ${id}\n`);
          controller.enqueue(`event: ${type}\n`);
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        },
      }),
    )
    .pipeThrough(createCallbacksTransformer(callbacks));
};
