import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

import { LobeRuntimeAI } from '../../core/BaseAI';
import {
  AWSBedrockClaudeStream,
  AWSBedrockLlamaStream,
  createBedrockStream,
} from '../../core/streams';
import {
  ChatMethodOptions,
  ChatStreamPayload,
  Embeddings,
  EmbeddingsOptions,
  EmbeddingsPayload,
  ModelProvider,
} from '../../types';
import { AgentRuntimeErrorType } from '../../types/error';
import { buildAnthropicMessages, buildAnthropicTools } from '../../utils/anthropicHelpers';
import { AgentRuntimeError } from '../../utils/createError';
import { debugStream } from '../../utils/debugStream';
import { StreamingResponse } from '../../utils/response';

/**
 * A prompt constructor for HuggingFace LLama 2 chat models.
 * Does not support `function` messages.
 * @see https://huggingface.co/meta-llama/Llama-2-70b-chat-hf and https://huggingface.co/blog/llama2#how-to-prompt-llama-2
 */
export function experimental_buildLlama2Prompt(messages: { content: string; role: string }[]) {
  const startPrompt = `<s>[INST] `;
  const endPrompt = ` [/INST]`;
  const conversation = messages.map(({ content, role }, index) => {
    switch (role) {
      case 'user': {
        return content.trim();
      }
      case 'assistant': {
        return ` [/INST] ${content}</s><s>[INST] `;
      }
      case 'function': {
        throw new Error('Llama 2 does not support function calls.');
      }
      default: {
        if (role === 'system' && index === 0) {
          return `<<SYS>>\n${content}\n<</SYS>>\n\n`;
        } else {
          throw new Error(`Invalid message role: ${role}`);
        }
      }
    }
  });

  return startPrompt + conversation.join('') + endPrompt;
}

export interface LobeBedrockAIParams {
  accessKeyId?: string;
  accessKeySecret?: string;
  region?: string;
  sessionToken?: string;
}

export class LobeBedrockAI implements LobeRuntimeAI {
  private client: BedrockRuntimeClient;

  region: string;

  constructor({ region, accessKeyId, accessKeySecret, sessionToken }: LobeBedrockAIParams = {}) {
    if (!(accessKeyId && accessKeySecret))
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidBedrockCredentials);
    this.region = region ?? 'us-east-1';
    this.client = new BedrockRuntimeClient({
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: accessKeySecret,
        sessionToken: sessionToken,
      },
      region: this.region,
    });
  }

  async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
    if (payload.model.startsWith('meta')) return this.invokeLlamaModel(payload, options);

    return this.invokeClaudeModel(payload, options);
  }
  /**
   * Supports the Amazon Titan Text models series.
   * Cohere Embed models are not supported
   * because the current text size per request
   * exceeds the maximum 2048 characters limit
   * for a single request for this series of models.
   * [bedrock embed guide] https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-embed.html
   */
  async embeddings(payload: EmbeddingsPayload, options?: EmbeddingsOptions): Promise<Embeddings[]> {
    const input = Array.isArray(payload.input) ? payload.input : [payload.input];
    const promises = input.map((inputText: string) =>
      this.invokeEmbeddingModel(
        {
          dimensions: payload.dimensions,
          input: inputText,
          model: payload.model,
        },
        options,
      ),
    );
    return Promise.all(promises);
  }

  private invokeEmbeddingModel = async (
    payload: EmbeddingsPayload,
    options?: EmbeddingsOptions,
  ): Promise<Embeddings> => {
    const command = new InvokeModelCommand({
      accept: 'application/json',
      body: JSON.stringify({
        dimensions: payload.dimensions,
        inputText: payload.input,
        normalize: true,
      }),
      contentType: 'application/json',
      modelId: payload.model,
    });
    try {
      const res = await this.client.send(command, { abortSignal: options?.signal });
      const responseBody = JSON.parse(new TextDecoder().decode(res.body));
      return responseBody.embedding;
    } catch (e) {
      const err = e as Error & { $metadata: any };
      throw AgentRuntimeError.chat({
        error: {
          body: err.$metadata,
          message: err.message,
          type: err.name,
        },
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Bedrock,
        region: this.region,
      });
    }
  };

  private invokeClaudeModel = async (
    payload: ChatStreamPayload,
    options?: ChatMethodOptions,
  ): Promise<Response> => {
    const { max_tokens, messages, model, temperature, top_p, tools } = payload;
    const system_message = messages.find((m) => m.role === 'system');
    const user_messages = messages.filter((m) => m.role !== 'system');

    const command = new InvokeModelWithResponseStreamCommand({
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: max_tokens || 4096,
        messages: await buildAnthropicMessages(user_messages),
        system: system_message?.content as string,
        temperature: temperature / 2,
        tools: buildAnthropicTools(tools),
        top_p: top_p,
      }),
      contentType: 'application/json',
      modelId: model,
    });

    try {
      // Ask Claude for a streaming chat completion given the prompt
      const res = await this.client.send(command, { abortSignal: options?.signal });

      const claudeStream = createBedrockStream(res);

      const [prod, debug] = claudeStream.tee();

      if (process.env.DEBUG_BEDROCK_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
      }

      // Respond with the stream
      return StreamingResponse(AWSBedrockClaudeStream(prod, options?.callback), {
        headers: options?.headers,
      });
    } catch (e) {
      const err = e as Error & { $metadata: any };

      throw AgentRuntimeError.chat({
        error: {
          body: err.$metadata,
          message: err.message,
          type: err.name,
        },
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Bedrock,
        region: this.region,
      });
    }
  };

  private invokeLlamaModel = async (
    payload: ChatStreamPayload,
    options?: ChatMethodOptions,
  ): Promise<Response> => {
    const { max_tokens, messages, model } = payload;
    const command = new InvokeModelWithResponseStreamCommand({
      accept: 'application/json',
      body: JSON.stringify({
        max_gen_len: max_tokens || 400,
        prompt: experimental_buildLlama2Prompt(messages as any),
      }),
      contentType: 'application/json',
      modelId: model,
    });

    try {
      // Ask Claude for a streaming chat completion given the prompt
      const res = await this.client.send(command);

      const stream = createBedrockStream(res);

      const [prod, debug] = stream.tee();

      if (process.env.DEBUG_BEDROCK_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
      }
      // Respond with the stream
      return StreamingResponse(AWSBedrockLlamaStream(prod, options?.callback), {
        headers: options?.headers,
      });
    } catch (e) {
      const err = e as Error & { $metadata: any };

      throw AgentRuntimeError.chat({
        error: {
          body: err.$metadata,
          message: err.message,
          region: this.region,
          type: err.name,
        },
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Bedrock,
        region: this.region,
      });
    }
  };
}

export default LobeBedrockAI;
