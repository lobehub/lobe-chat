import { InvokeModelWithResponseStreamResponse } from '@aws-sdk/client-bedrock-runtime';
import { nanoid } from '@lobechat/utils';

import { ChatStreamCallbacks } from '../../../types';
import { transformAnthropicStream } from '../anthropic';
import {
  StreamContext,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from '../protocol';
import { createBedrockStream } from './common';

export const AWSBedrockClaudeStream = (
  res: InvokeModelWithResponseStreamResponse | ReadableStream,
  cb?: ChatStreamCallbacks,
): ReadableStream<string> => {
  const streamStack: StreamContext = { id: 'chat_' + nanoid() };

  const stream = res instanceof ReadableStream ? res : createBedrockStream(res);

  return stream
    .pipeThrough(createSSEProtocolTransformer(transformAnthropicStream, streamStack))
    .pipeThrough(createCallbacksTransformer(cb));
};
