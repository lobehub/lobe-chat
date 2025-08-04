import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

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
import { buildAnthropicMessages, buildAnthropicTools } from '../utils/anthropicHelpers';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import {
  AWSBedrockClaudeStream,
  AWSBedrockLlamaStream,
  createBedrockStream,
  OpenAIStream,
} from '../utils/streams';

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
  token?: string;
}

export class LobeBedrockAI implements LobeRuntimeAI {
  private client: BedrockRuntimeClient;
  private bearerToken?: string;

  region: string;

  constructor({ region, accessKeyId, accessKeySecret, sessionToken, token }: LobeBedrockAIParams = {}) {
    this.region = region ?? 'us-east-1';
    this.bearerToken = token;
    
    if (token) {
      // For bearer token, we'll handle requests manually
      // Initialize a dummy client to satisfy the interface
      this.client = new BedrockRuntimeClient({ region: this.region });
    } else {
      if (!(accessKeyId && accessKeySecret))
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidBedrockCredentials);
      this.client = new BedrockRuntimeClient({
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: accessKeySecret,
          sessionToken: sessionToken,
        },
        region: this.region,
      });
    }
  }

  async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
    if (this.bearerToken) {
      // Use bearer token authentication with direct HTTP requests
      return this.invokeBearerTokenModel(payload, options);
    }
    
    // Use AWS SDK authentication
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
      this.bearerToken
        ? this.invokeEmbeddingModelWithBearerToken(
            {
              dimensions: payload.dimensions,
              input: inputText,
              model: payload.model,
            },
            options,
          )
        : this.invokeEmbeddingModel(
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
    if (this.bearerToken) {
      // For bearer token, get models from environment config
      const { getLLMConfig } = await import('@/config/llm');
      const config = getLLMConfig();
      const modelList = config.AWS_BEDROCK_MODEL_LIST;
      
      if (!modelList) {
        const BedrockProvider = await import('@/config/modelProviders/bedrock');
        return BedrockProvider.default.chatModels.filter(model => model.enabled !== false);
      }
      
      // Parse model list: -all,+model1,+model2,model3
      const items = modelList.split(',').map(m => m.trim()).filter(Boolean);
      const enabledModels = [];
      
      for (const item of items) {
        if (item.startsWith('+')) {
          enabledModels.push(item.substring(1));
        } else if (!item.startsWith('-') && item !== 'all') {
          enabledModels.push(item);
        }
      }
      
      return enabledModels.map(id => ({ id }));
    }
    
    // For AWS SDK, use default models
    const BedrockProvider = await import('@/config/modelProviders/bedrock');
    return BedrockProvider.default.chatModels.filter(model => model.enabled !== false);
  }

  private async invokeBearerTokenModel(
    payload: ChatStreamPayload,
    options?: ChatMethodOptions,
  ): Promise<Response> {
    const { max_tokens, messages, model, temperature, top_p, tools: _tools } = payload;
    const system_message = messages.find((m) => m.role === 'system');
    const user_messages = messages.filter((m) => m.role !== 'system');

    // Use the Converse API format for bearer token requests
    const converseMessages = user_messages
      .filter(msg => msg.content && (msg.content as string).trim())
      .map(msg => ({
        content: [{ text: (msg.content as string).trim() }],
        role: msg.role === 'assistant' ? 'assistant' : 'user',
      }));

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
          
          function pump(): Promise<void> {
            return reader.read().then(({ done, value }) => {
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
                  const jsonStr = buffer.substring(jsonStart, jsonEnd);
                  
                  try {
                    const data = JSON.parse(jsonStr);
                    
                    // Only extract actual response text, not reasoning
                    const text = data.delta?.text;
                    
                    if (text && text.trim()) {
                      // Create OpenAI-compatible chunk
                      const openaiChunk = {
                        choices: [{
                          delta: { content: text },
                          finish_reason: null,
                          index: 0
                        }],
                        created: Math.floor(Date.now() / 1000),
                        id: 'chatcmpl-bedrock',
                        model: model,
                        object: 'chat.completion.chunk'
                      };
                      controller.enqueue(openaiChunk);
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                  
                  buffer = buffer.substring(jsonEnd);
                  jsonStart = buffer.indexOf('{');
                } else {
                  break; // Incomplete JSON, wait for more data
                }
              }
              
              return pump();
            });
          }
          
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
const url = `https://bedrock-runtime.${this.region}.amazonaws.com/model/${payload.model}/invoke`;

    try {
      // Import and use a CSRF token library (e.g., csurf for Express.js)
      const csrfToken = await this.getCsrfToken(); // Assume this method exists to retrieve a CSRF token

      const response = await fetch(url, {
        body: JSON.stringify(requestBody),
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken, // Add CSRF token to the request headers
        },
        method: 'POST',
        signal: options?.signal,
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
