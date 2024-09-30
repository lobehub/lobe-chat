import { InvokeModelWithResponseStreamResponse } from '@aws-sdk/client-bedrock-runtime';

import { nanoid } from '@/utils/uuid';

import { ChatStreamCallbacks } from '../../../types';
import {
  StreamProtocolChunk,
  StreamStack,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from '../protocol';
import { createBedrockStream } from './common';

interface AmazonBedrockInvocationMetrics {
  firstByteLatency: number;
  inputTokenCount: number;
  invocationLatency: number;
  outputTokenCount: number;
}

// https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-cohere-command-r-plus.html
interface BedrockCohereStreamChunk {
  'amazon-bedrock-invocationMetrics'?: AmazonBedrockInvocationMetrics;
  'citations'?: {
    'document_ids': string[];
    'end': number;
    'start': number;
    'text': string;
  }[];
  'finish_reason': string;
  'generation_id': string;
  'meta'?: {
    'api_version': {
      'version': string;
    };
    'billed_units': {
      'input_tokens': number;
      'output_tokens': number;
    };
  };
  'response_id': string;
  'text': string;
  'tool_calls'?: {
    'name': string;
    'parameters': {
      [key: string]: string;
    };
  }[];
}

export const transformCohereStream = (
  chunk: BedrockCohereStreamChunk,
  stack: StreamStack,
): StreamProtocolChunk => {
  // remove 'amazon-bedrock-invocationMetrics' from chunk
  delete chunk['amazon-bedrock-invocationMetrics'];

  if (chunk.finish_reason) {
    return { data: chunk.finish_reason, id: stack.id, type: 'stop' };
  }

  return { data: chunk.text, id: stack.id, type: 'text' };
};

export const AWSBedrockCohereStream = (
  res: InvokeModelWithResponseStreamResponse | ReadableStream,
  cb?: ChatStreamCallbacks,
): ReadableStream<string> => {
  const streamStack: StreamStack = { id: 'chat_' + nanoid() };

  const stream = res instanceof ReadableStream ? res : createBedrockStream(res);

  return stream
    .pipeThrough(createSSEProtocolTransformer(transformCohereStream, streamStack))
    .pipeThrough(createCallbacksTransformer(cb));
};
