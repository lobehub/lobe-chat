import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { AWSBedrockAnthropicStream, StreamingTextResponse } from 'ai';
import { experimental_buildAnthropicPrompt } from 'ai/prompts';

import { ChatStreamPayload } from '@/types/openai/chat';

import { LobeRuntimeAI } from '../BaseAI';

interface LobeBedrockAIParams {
  accessKeyId: string;
  accessKeySecret: string;
  region?: string;
}

export class LobeBedrockAI implements LobeRuntimeAI {
  private client: BedrockRuntimeClient;

  baseURL: string = 'https://bedrock.us-east-1.amazonaws.com';

  constructor({ region, accessKeyId, accessKeySecret }: LobeBedrockAIParams) {
    this.client = new BedrockRuntimeClient({
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: accessKeySecret,
      },
      region: region ?? 'us-east-1',
    });
  }

  async chat(payload: ChatStreamPayload) {
    // Ask Claude for a streaming chat completion given the prompt
    const bedrockResponse = await this.client.send(
      new InvokeModelWithResponseStreamCommand({
        accept: 'application/json',
        body: JSON.stringify({
          max_tokens_to_sample: payload.max_tokens,
          prompt: experimental_buildAnthropicPrompt(payload.messages as any),
        }),
        contentType: 'application/json',
        modelId: 'anthropic.claude-v2',
      }),
    );

    // Convert the response into a friendly text-stream
    const stream = AWSBedrockAnthropicStream(bedrockResponse);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  }
}

export default LobeBedrockAI;
