import { InvokeModelWithResponseStreamResponse } from '@aws-sdk/client-bedrock-runtime';
import { type AIStreamCallbacksAndOptions, createCallbacksTransformer } from 'ai';

import { nanoid } from '@/utils/uuid';

import { transformAnthropicStream } from '../anthropic';
import { StreamStack, createSSEProtocolTransformer } from '../protocol';
import { createBedrockStream } from './common';

export const AWSBedrockClaudeStream = (
  res: InvokeModelWithResponseStreamResponse | ReadableStream,
  cb?: AIStreamCallbacksAndOptions,
): ReadableStream<string> => {
  const streamStack: StreamStack = { id: 'chat_' + nanoid() };

  const stream = res instanceof ReadableStream ? res : createBedrockStream(res);

  return stream
    .pipeThrough(createSSEProtocolTransformer(transformAnthropicStream, streamStack))
    .pipeThrough(createCallbacksTransformer(cb) as any);
};
