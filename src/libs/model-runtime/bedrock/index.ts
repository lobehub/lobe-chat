import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import {
  ChatMethodOptions,
  ChatStreamPayload,
  Embeddings,
  EmbeddingsOptions,
  EmbeddingsPayload,
  ModelProvider,
} from '../types';
import { buildAnthropicTools } from '../utils/anthropicHelpers';
import { AgentRuntimeError } from '../utils/createError';
import { StreamingResponse } from '../utils/response';
import { OpenAIStream } from '../utils/streams';

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
  region?: string;
  token?: string;
}

export class LobeBedrockAI implements LobeRuntimeAI {
  private client: BedrockRuntimeClient;
  private bearerToken?: string;

  region: string;

  constructor({ region, token }: LobeBedrockAIParams = {}) {
    this.region = region ?? 'us-east-1';
    this.bearerToken = token;

    if (!token) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidBedrockCredentials);
    }

    // Initialize a dummy client to satisfy the interface
    try {
      this.client = new BedrockRuntimeClient({ region: this.region });
    } catch {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidBedrockRegion);
    }
  }

  async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
    // Always use bearer token authentication with direct HTTP requests
    return this.invokeBearerTokenModel(payload, options);
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
      this.invokeEmbeddingModelWithBearerToken(
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

  async models() {
    // Get models from environment config
    const { getLLMConfig } = await import('@/config/llm');
    const config = getLLMConfig();
    const modelList = config.AWS_BEDROCK_MODEL_LIST;

    if (!modelList) {
      const BedrockProvider = await import('@/config/modelProviders/bedrock');
      return BedrockProvider.default.chatModels.filter((model) => model.enabled !== false);
    }

    // Parse model list: -all,+model1,+model2,model3
    const items = modelList
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    const enabledModels = [];

    for (const item of items) {
      if (item.startsWith('+')) {
        enabledModels.push(item.slice(1));
      } else if (!item.startsWith('-') && item !== 'all') {
        enabledModels.push(item);
      }
    }

    return enabledModels.map((id) => ({ id }));
  }

  private async invokeBearerTokenModel(
    payload: ChatStreamPayload,
    options?: ChatMethodOptions,
  ): Promise<Response> {
    const { max_tokens, messages, model, temperature, top_p, tools: _tools } = payload;
    // Use a type-safe approach to find the system message
    const system_message = messages.find(
      (m): m is { content: string; role: 'system' } =>
        m.role === 'system' && typeof m.content === 'string',
    );
    const user_messages = messages.filter((m) => m.role !== 'system');

    // Use the Converse API format for bearer token requests
    const converseMessages = user_messages
      .filter((msg) => msg.content && (msg.content as string).trim())
      .map((msg) => ({
        content: [{ text: (msg.content as string).trim() }],
        role: msg.role === 'assistant' ? 'assistant' : 'user',
      }));

    // Ensure at least one valid message exists
    if (converseMessages.length === 0) {
      throw new Error('No valid user messages found. At least one non-empty message is required.');
    }

    const requestBody: any = {
      inferenceConfig: {
        maxTokens: max_tokens || 4096,
      },
      messages: converseMessages,
    };

    // Add system message if present
    if (system_message?.content) {
      requestBody.system = [{ text: system_message.content as string }];
    }

    // Add temperature and top_p if specified
    if (temperature !== undefined) {
      requestBody.inferenceConfig.temperature = temperature / 2;
    }
    if (top_p !== undefined) {
      requestBody.inferenceConfig.topP = top_p;
    }

    // Add tools if present
    if (_tools && _tools.length > 0) {
      requestBody.toolConfig = {
        tools: buildAnthropicTools(_tools),
      };
    }

    const url = `https://bedrock-runtime.${this.region}.amazonaws.com/model/${model}/converse-stream`;

    try {
      const response = await fetch(url, {
        body: JSON.stringify(requestBody),
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: options?.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Create OpenAI-compatible stream
      const openaiStream = new ReadableStream({
        start(controller) {
          if (!response.body) {
            controller.close();
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const pump = (): Promise<void> => {
            return reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Look for JSON objects in the stream
                let jsonStart = buffer.indexOf('{');
                while (jsonStart !== -1) {
                  let braceCount = 0;
                  let jsonEnd = jsonStart;

                  // Find the end of the JSON object
                  for (let i = jsonStart; i < buffer.length; i++) {
                    if (buffer[i] === '{') braceCount++;
                    if (buffer[i] === '}') braceCount--;
                    if (braceCount === 0) {
                      jsonEnd = i + 1;
                      break;
                    }
                  }

                  if (braceCount === 0) {
                    const jsonStr = buffer.slice(jsonStart, jsonEnd);

                    try {
                      const data = JSON.parse(jsonStr);

                      // Only extract actual response text, not reasoning
                      const text = data.delta?.text;

                      if (text && text.trim()) {
                        // Create OpenAI-compatible chunk
                        const openaiChunk = {
                          choices: [
                            {
                              delta: { content: text },
                              finish_reason: null,
                              index: 0,
                            },
                          ],
                          created: Math.floor(Date.now() / 1000),
                          id: 'chatcmpl-bedrock',
                          model: model,
                          object: 'chat.completion.chunk',
                        };
                        controller.enqueue(openaiChunk);
                      }
                    } catch {
                      // Skip invalid JSON
                    }

                    buffer = buffer.slice(jsonEnd);
                    jsonStart = buffer.indexOf('{');
                  } else {
                    break; // Incomplete JSON, wait for more data
                  }
                }

                return pump();
              })
              .catch((error) => {
                controller.error(error);
              });
          };

          return pump();
        },
      });

      return StreamingResponse(OpenAIStream(openaiStream, { callbacks: options?.callback }), {
        headers: options?.headers,
      });
    } catch (e) {
      const err = e as Error;
      throw AgentRuntimeError.chat({
        error: {
          body: undefined,
          message: err.message,
          type: err.name,
        },
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Bedrock,
        region: this.region,
      });
    }
  }

  private async invokeEmbeddingModelWithBearerToken(
    payload: EmbeddingsPayload,
    options?: EmbeddingsOptions,
  ): Promise<Embeddings> {
    const requestBody = {
      dimensions: payload.dimensions,
      inputText: payload.input,
      normalize: true,
    };

    const url = `https://bedrock-runtime.${this.region}.amazonaws.com/model/${payload.model}/invoke`;

    try {
      const response = await fetch(url, {
        body: JSON.stringify(requestBody),
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: options?.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseBody = await response.json();
      return responseBody.embedding;
    } catch (e) {
      const err = e as Error;
      throw AgentRuntimeError.chat({
        error: {
          body: undefined,
          message: err.message,
          type: err.name,
        },
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Bedrock,
        region: this.region,
      });
    }
  }
}

export default LobeBedrockAI;
