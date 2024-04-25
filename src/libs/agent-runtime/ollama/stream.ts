// copy from https://github.com/vercel/ai/discussions/539#discussioncomment-8193721
// and I have remove the unnecessary code
import {
  type AIStreamCallbacksAndOptions,
  createCallbacksTransformer,
  createStreamDataTransformer,
  readableFromAsyncIterable,
} from 'ai';
import { ChatResponse } from 'ollama/browser';

// A modified version of the streamable function specifically for chat messages
const chatStreamable = async function* (stream: AsyncIterable<ChatResponse>) {
  for await (const response of stream) {
    if (response.message) {
      yield response.message;
    }
    if (response.done) {
      // Additional final response data can be handled here if necessary
      return;
    }
  }
};

export const OllamaStream = (
  res: AsyncIterable<ChatResponse>,
  cb?: AIStreamCallbacksAndOptions,
): ReadableStream<string> => {
  return readableFromAsyncIterable(chatStreamable(res))
    .pipeThrough(createCallbacksTransformer(cb) as any)
    .pipeThrough(createStreamDataTransformer(cb?.experimental_streamData));
};
