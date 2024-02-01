import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { AWSBedrockAnthropicStream, AWSBedrockLlama2Stream, StreamingTextResponse } from 'ai';
import { experimental_buildAnthropicPrompt, experimental_buildLlama2Prompt } from 'ai/prompts';

import { ChatStreamPayload } from '@/types/openai/chat';

import { LobeRuntimeAI } from '../BaseAI';
import { CompletionError, ModelProvider } from '../type';
import { debugStream } from '../utils/debugStream';
import { DEBUG_CHAT_COMPLETION } from '../utils/env';

export interface LobeBedrockAIParams {
  accessKeyId: string;
  accessKeySecret: string;
  region?: string;
}

export class LobeBedrockAI implements LobeRuntimeAI {
  private client: BedrockRuntimeClient;

  region: string = 'us-east-1';

  constructor({ region, accessKeyId, accessKeySecret }: LobeBedrockAIParams) {
    this.region = region ?? 'us-east-1';

    this.client = new BedrockRuntimeClient({
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: accessKeySecret,
      },
      region: this.region,
    });
  }

  async chat(payload: ChatStreamPayload) {
    if (payload.model.startsWith('meta')) return this.invokeLlamaModel(payload);

    return this.invokeClaudeModel(payload);
  }

  private invokeClaudeModel = async (payload: ChatStreamPayload) => {
    const command = new InvokeModelWithResponseStreamCommand({
      accept: 'application/json',
      body: JSON.stringify({
        max_tokens_to_sample: payload.max_tokens || 400,
        prompt: experimental_buildAnthropicPrompt(payload.messages as any),
      }),
      contentType: 'application/json',
      modelId: payload.model,
    });

    try {
      // Ask Claude for a streaming chat completion given the prompt
      const bedrockResponse = await this.client.send(command);

      // Convert the response into a friendly text-stream
      const stream = AWSBedrockAnthropicStream(bedrockResponse);

      const [debug, output] = stream.tee();

      if (DEBUG_CHAT_COMPLETION) {
        debugStream(debug).catch(console.error);
      }
      // Respond with the stream
      return new StreamingTextResponse(output);
    } catch (e) {
      const err = e as Error & { $metadata: any };

      const error: CompletionError = {
        error: {
          body: err.$metadata,
          message: err.message,
          region: this.region,
          type: err.name,
        },
        errorType: 'OpenAIBizError',
        provider: ModelProvider.Bedrock,
      };

      throw error;
    }
  };

  private invokeLlamaModel = async (payload: ChatStreamPayload) => {
    const command = new InvokeModelWithResponseStreamCommand({
      accept: 'application/json',
      body: JSON.stringify({
        max_gen_len: payload.max_tokens || 400,
        prompt: experimental_buildLlama2Prompt(payload.messages as any),
      }),
      contentType: 'application/json',
      modelId: payload.model,
    });

    try {
      // Ask Claude for a streaming chat completion given the prompt
      const bedrockResponse = await this.client.send(command);

      // Convert the response into a friendly text-stream
      const stream = AWSBedrockLlama2Stream(bedrockResponse);

      const [debug, output] = stream.tee();

      if (DEBUG_CHAT_COMPLETION) {
        debugStream(debug).catch(console.error);
      }
      // Respond with the stream
      return new StreamingTextResponse(output);
    } catch (e) {
      const err = e as Error & { $metadata: any };

      const error: CompletionError = {
        error: {
          body: err.$metadata,
          message: err.message,
          region: this.region,
          type: err.name,
        },
        errorType: 'OpenAIBizError',
        provider: ModelProvider.Bedrock,
      };

      throw error;
    }
  };
}

export default LobeBedrockAI;
