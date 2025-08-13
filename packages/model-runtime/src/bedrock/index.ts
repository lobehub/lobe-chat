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
import { StreamingJsonParser } from '../utils/streamingJsonParser';
import { OpenAIStream } from '../utils/streams';
import { parseModelList } from './modelListParser';
import {
  VALID_BEDROCK_REGIONS,
  buildConverseRequestBody,
  createBedrockRequestOptions,
  fetchWithRetry,
  handleBedrockError,
  processConverseMessages,
} from './utils';

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
  private bearerToken?: string;

  region: string;

  constructor({ region, token }: LobeBedrockAIParams = {}) {
    this.region = region ?? 'us-east-1';
    this.bearerToken = token;

    if (!token) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidBedrockCredentials);
    }

    // Validate region against official AWS Bedrock regions
    if (!VALID_BEDROCK_REGIONS.has(this.region)) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidBedrockRegion);
    }

    // No BedrockRuntimeClient is instantiated here, as requests are made directly via HTTP.
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

    // Get all available models from the provider config
    const BedrockProvider = await import('@/config/modelProviders/bedrock');
    const ALL_AVAILABLE_MODELS = BedrockProvider.default.chatModels
      .filter((model) => model.enabled !== false)
      .map((model) => model.id);

    // Parse modelList using utility function
    const finalModels = parseModelList(modelList, ALL_AVAILABLE_MODELS);
    return finalModels.map((id) => ({ id }));
  }

  private async invokeBearerTokenModel(
    payload: ChatStreamPayload,
    options?: ChatMethodOptions,
  ): Promise<Response> {
    const { messages, model, tools: _tools } = payload;

    // Process messages using helper function
    const { converseMessages, systemMessage } = processConverseMessages(messages);

    // Ensure at least one valid message exists
    if (converseMessages.length === 0 && !systemMessage?.content) {
      throw new Error('No valid user messages found. At least one non-empty message is required.');
    }

    // Build request body using helper function
    const tools = _tools && _tools.length > 0 ? buildAnthropicTools(_tools) : undefined;
    const requestBody = buildConverseRequestBody(payload, converseMessages, systemMessage, tools);

    const url = `https://bedrock-runtime.${this.region}.amazonaws.com/model/${model}/converse-stream`;

    try {
      const { options: fetchOptions, cleanup } = createBedrockRequestOptions(
        requestBody,
        this.bearerToken!,
        options?.signal,
      );

      const response = await fetchWithRetry(url, fetchOptions);
      cleanup();

      if (!response.ok) {
        const errorText = await response.text();
        throw AgentRuntimeError.chat({
          error: {
            body: errorText,
            message: `HTTP ${response.status}: ${errorText}`,
            type: 'HTTPError',
          },
          errorType: AgentRuntimeErrorType.ProviderBizError,
          provider: ModelProvider.Bedrock,
          region: this.region,
        });
      }

      return this.createStreamingResponse(response, model, options);
    } catch (e) {
      throw handleBedrockError(e, this.region);
    }
  }

  private createStreamingResponse(
    response: Response,
    model: string,
    options?: ChatMethodOptions,
  ): Response {
    // Create OpenAI-compatible stream
    const openaiStream = new ReadableStream({
      start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const jsonParser = new StreamingJsonParser();

        const pump = (): Promise<void> => {
          return reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              const jsonObjects = jsonParser.processChunk(chunk);

              for (const data of jsonObjects) {
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

    try {
      const stream = OpenAIStream(openaiStream, { callbacks: options?.callback });
      return StreamingResponse(stream, {
        headers: options?.headers,
      });
    } catch (streamError) {
      throw AgentRuntimeError.chat({
        error: {
          body: undefined,
          message: `OpenAIStream error: ${(streamError as Error).message}`,
          type: 'StreamError',
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
      const { options: fetchOptions, cleanup } = createBedrockRequestOptions(
        requestBody,
        this.bearerToken!,
        options?.signal,
      );

      const response = await fetchWithRetry(url, fetchOptions);
      cleanup();

      if (!response.ok) {
        const errorText = await response.text();
        throw AgentRuntimeError.chat({
          error: {
            body: errorText,
            message: `HTTP ${response.status}: ${errorText}`,
            type: 'HTTPError',
          },
          errorType: AgentRuntimeErrorType.ProviderBizError,
          provider: ModelProvider.Bedrock,
          region: this.region,
        });
      }

      const responseBody = await response.json();

      // Validate response structure to handle potential API changes
      if (!responseBody || typeof responseBody !== 'object') {
        throw new Error('Invalid response format from embedding API');
      }

      if (!responseBody.embedding || !Array.isArray(responseBody.embedding)) {
        throw new Error('Missing or invalid embedding data in response');
      }

      return responseBody.embedding;
    } catch (e) {
      throw handleBedrockError(e, this.region);
    }
  }
}

export default LobeBedrockAI;
