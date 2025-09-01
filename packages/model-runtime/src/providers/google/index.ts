import {
  Content,
  FunctionDeclaration,
  GenerateContentConfig,
  Tool as GoogleFunctionCallTool,
  GoogleGenAI,
  HttpOptions,
  Part,
  Type as SchemaType,
  ThinkingConfig,
} from '@google/genai';

import { LobeRuntimeAI } from '../../core/BaseAI';
import { GoogleGenerativeAIStream, VertexAIStream } from '../../core/streams';
import {
  ChatCompletionTool,
  ChatMethodOptions,
  ChatStreamPayload,
  OpenAIChatMessage,
  UserMessageContentPart,
} from '../../types';
import { AgentRuntimeErrorType } from '../../types/error';
import { CreateImagePayload, CreateImageResponse } from '../../types/image';
import { AgentRuntimeError } from '../../utils/createError';
import { debugStream } from '../../utils/debugStream';
import { parseGoogleErrorMessage } from '../../utils/googleErrorParser';
import { imageUrlToBase64 } from '../../utils/imageToBase64';
import { StreamingResponse } from '../../utils/response';
import { safeParseJSON } from '../../utils/safeParseJSON';
import { parseDataUri } from '../../utils/uriParser';
import { createGoogleImage } from './createImage';

const modelsOffSafetySettings = new Set(['gemini-2.0-flash-exp']);

const modelsWithModalities = new Set([
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.5-flash-image-preview',
]);

const modelsDisableInstuction = new Set([
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.5-flash-image-preview',
  'gemma-3-1b-it',
  'gemma-3-4b-it',
  'gemma-3-12b-it',
  'gemma-3-27b-it',
  'gemma-3n-e4b-it',
]);

export interface GoogleModelCard {
  displayName: string;
  inputTokenLimit: number;
  name: string;
  outputTokenLimit: number;
}

enum HarmCategory {
  HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT',
  HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
  HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
  HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
}

enum HarmBlockThreshold {
  BLOCK_NONE = 'BLOCK_NONE',
}

function getThreshold(model: string): HarmBlockThreshold {
  if (modelsOffSafetySettings.has(model)) {
    return 'OFF' as HarmBlockThreshold; // https://discuss.ai.google.dev/t/59352
  }
  return HarmBlockThreshold.BLOCK_NONE;
}

const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com';

interface LobeGoogleAIParams {
  apiKey?: string;
  baseURL?: string;
  client?: GoogleGenAI;
  defaultHeaders?: Record<string, any>;
  id?: string;
  isVertexAi?: boolean;
}

const isAbortError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return (
    message.includes('aborted') ||
    message.includes('cancelled') ||
    message.includes('error reading from the stream') ||
    message.includes('abort') ||
    error.name === 'AbortError'
  );
};

export class LobeGoogleAI implements LobeRuntimeAI {
  private client: GoogleGenAI;
  private isVertexAi: boolean;
  baseURL?: string;
  apiKey?: string;
  provider: string;

  constructor({
    apiKey,
    baseURL,
    client,
    isVertexAi,
    id,
    defaultHeaders,
  }: LobeGoogleAIParams = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    const httpOptions = baseURL
      ? ({ baseUrl: baseURL, headers: defaultHeaders } as HttpOptions)
      : undefined;

    this.apiKey = apiKey;
    this.client = client ? client : new GoogleGenAI({ apiKey, httpOptions });
    this.baseURL = client ? undefined : baseURL || DEFAULT_BASE_URL;
    this.isVertexAi = isVertexAi || false;

    this.provider = id || (isVertexAi ? 'vertexai' : 'google');
  }

  async chat(rawPayload: ChatStreamPayload, options?: ChatMethodOptions) {
    try {
      const payload = this.buildPayload(rawPayload);
      const { model, thinkingBudget } = payload;

      const thinkingConfig: ThinkingConfig = {
        includeThoughts:
          !!thinkingBudget ||
          (!thinkingBudget && model && (model.includes('-2.5-') || model.includes('thinking')))
            ? true
            : undefined,
        // https://ai.google.dev/gemini-api/docs/thinking#set-budget
        thinkingBudget: (() => {
          if (thinkingBudget !== undefined && thinkingBudget !== null) {
            if (model.includes('-2.5-flash-lite')) {
              if (thinkingBudget === 0 || thinkingBudget === -1) {
                return thinkingBudget;
              }
              return Math.max(512, Math.min(thinkingBudget, 24_576));
            } else if (model.includes('-2.5-flash')) {
              return Math.min(thinkingBudget, 24_576);
            } else if (model.includes('-2.5-pro')) {
              return thinkingBudget === -1 ? -1 : Math.max(128, Math.min(thinkingBudget, 32_768));
            }
            return Math.min(thinkingBudget, 24_576);
          }

          if (model.includes('-2.5-pro') || model.includes('-2.5-flash')) {
            return -1;
          } else if (model.includes('-2.5-flash-lite')) {
            return 0;
          }
          return undefined;
        })(),
      };

      const contents = await this.buildGoogleMessages(payload.messages);

      const controller = new AbortController();
      const originalSignal = options?.signal;

      if (originalSignal) {
        if (originalSignal.aborted) {
          controller.abort();
        } else {
          originalSignal.addEventListener('abort', () => {
            controller.abort();
          });
        }
      }

      const config: GenerateContentConfig = {
        abortSignal: originalSignal,
        maxOutputTokens: payload.max_tokens,
        responseModalities: modelsWithModalities.has(model) ? ['Text', 'Image'] : undefined,
        // avoid wide sensitive words
        // refs: https://github.com/lobehub/lobe-chat/pull/1418
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: getThreshold(model),
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: getThreshold(model),
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: getThreshold(model),
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: getThreshold(model),
          },
        ],
        systemInstruction: modelsDisableInstuction.has(model)
          ? undefined
          : (payload.system as string),
        temperature: payload.temperature,
        thinkingConfig:
          modelsDisableInstuction.has(model) || model.toLowerCase().includes('learnlm')
            ? undefined
            : thinkingConfig,
        tools: this.buildGoogleTools(payload.tools, payload),
        topP: payload.top_p,
      };

      const inputStartAt = Date.now();

      const geminiStreamResponse = await this.client.models.generateContentStream({
        config,
        contents,
        model,
      });

      const googleStream = this.createEnhancedStream(geminiStreamResponse, controller.signal);
      const [prod, useForDebug] = googleStream.tee();

      const key = this.isVertexAi
        ? 'DEBUG_VERTEX_AI_CHAT_COMPLETION'
        : 'DEBUG_GOOGLE_CHAT_COMPLETION';

      if (process.env[key] === '1') {
        debugStream(useForDebug).catch();
      }

      // Convert the response into a friendly text-stream
      const Stream = this.isVertexAi ? VertexAIStream : GoogleGenerativeAIStream;
      const stream = Stream(prod, { callbacks: options?.callback, inputStartAt });

      // Respond with the stream
      return StreamingResponse(stream, { headers: options?.headers });
    } catch (e) {
      const err = e as Error;

      // 移除之前的静默处理，统一抛出错误
      if (isAbortError(err)) {
        console.log('Request was cancelled');
        throw AgentRuntimeError.chat({
          error: { message: 'Request was cancelled' },
          errorType: AgentRuntimeErrorType.ProviderBizError,
          provider: this.provider,
        });
      }

      console.log(err);
      const { errorType, error } = parseGoogleErrorMessage(err.message);

      throw AgentRuntimeError.chat({ error, errorType, provider: this.provider });
    }
  }

  /**
   * Generate images using Google AI Imagen API or Gemini Chat Models
   * @see https://ai.google.dev/gemini-api/docs/image-generation#imagen
   */
  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    return createGoogleImage(this.client, this.provider, payload);
  }

  private createEnhancedStream(originalStream: any, signal: AbortSignal): ReadableStream {
    return new ReadableStream({
      async start(controller) {
        let hasData = false;

        try {
          for await (const chunk of originalStream) {
            if (signal.aborted) {
              // 如果有数据已经输出，优雅地关闭流而不是抛出错误
              if (hasData) {
                console.log('Stream cancelled gracefully, preserving existing output');
                controller.close();
                return;
              } else {
                // 如果还没有数据输出，则抛出取消错误
                throw new Error('Stream cancelled');
              }
            }

            hasData = true;
            controller.enqueue(chunk);
          }
        } catch (error) {
          const err = error as Error;

          // 统一处理所有错误，包括 abort 错误
          if (isAbortError(err) || signal.aborted) {
            // 如果有数据已经输出，优雅地关闭流
            if (hasData) {
              console.log('Stream reading cancelled gracefully, preserving existing output');
              controller.close();
              return;
            } else {
              console.log('Stream reading cancelled before any output');
              controller.error(new Error('Stream cancelled'));
              return;
            }
          } else {
            // 处理其他流解析错误
            console.error('Stream parsing error:', err);
            controller.error(err);
            return;
          }
        }

        controller.close();
      },
    });
  }

  async models(options?: { signal?: AbortSignal }) {
    try {
      const url = `${this.baseURL}/v1beta/models?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'GET',
        signal: options?.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      const modelList: GoogleModelCard[] = json.models;

      const processedModels = modelList.map((model) => {
        const id = model.name.replace(/^models\//, '');

        return {
          contextWindowTokens: (model.inputTokenLimit || 0) + (model.outputTokenLimit || 0),
          displayName: model.displayName || id,
          id,
          maxOutput: model.outputTokenLimit || undefined,
        };
      });

      const { MODEL_LIST_CONFIGS, processModelList } = await import('../../utils/modelParse');

      return processModelList(processedModels, MODEL_LIST_CONFIGS.google, 'google');
    } catch (error) {
      console.error('Failed to fetch Google models:', error);
      throw error;
    }
  }

  private buildPayload(payload: ChatStreamPayload) {
    const system_message = payload.messages.find((m) => m.role === 'system');
    const user_messages = payload.messages.filter((m) => m.role !== 'system');

    return {
      ...payload,
      messages: user_messages,
      system: system_message?.content,
    };
  }

  private convertContentToGooglePart = async (
    content: UserMessageContentPart,
  ): Promise<Part | undefined> => {
    switch (content.type) {
      default: {
        return undefined;
      }

      case 'text': {
        return { text: content.text };
      }

      case 'image_url': {
        const { mimeType, base64, type } = parseDataUri(content.image_url.url);

        if (type === 'base64') {
          if (!base64) {
            throw new TypeError("Image URL doesn't contain base64 data");
          }

          return {
            inlineData: {
              data: base64,
              mimeType: mimeType || 'image/png',
            },
          };
        }

        if (type === 'url') {
          const { base64, mimeType } = await imageUrlToBase64(content.image_url.url);

          return {
            inlineData: {
              data: base64,
              mimeType,
            },
          };
        }

        throw new TypeError(`currently we don't support image url: ${content.image_url.url}`);
      }
    }
  };

  private convertOAIMessagesToGoogleMessage = async (
    message: OpenAIChatMessage,
    toolCallNameMap?: Map<string, string>,
  ): Promise<Content> => {
    const content = message.content as string | UserMessageContentPart[];
    if (!!message.tool_calls) {
      return {
        parts: message.tool_calls.map<Part>((tool) => ({
          functionCall: {
            args: safeParseJSON(tool.function.arguments)!,
            name: tool.function.name,
          },
        })),
        role: 'model',
      };
    }

    // 将 tool_call result 转成 functionResponse part
    if (message.role === 'tool' && toolCallNameMap && message.tool_call_id) {
      const functionName = toolCallNameMap.get(message.tool_call_id);
      if (functionName) {
        return {
          parts: [
            {
              functionResponse: {
                name: functionName,
                response: { result: message.content },
              },
            },
          ],
          role: 'user',
        };
      }
    }

    const getParts = async () => {
      if (typeof content === 'string') return [{ text: content }];

      const parts = await Promise.all(
        content.map(async (c) => await this.convertContentToGooglePart(c)),
      );
      return parts.filter(Boolean) as Part[];
    };

    return {
      parts: await getParts(),
      role: message.role === 'assistant' ? 'model' : 'user',
    };
  };

  // convert messages from the OpenAI format to Google GenAI SDK
  private buildGoogleMessages = async (messages: OpenAIChatMessage[]): Promise<Content[]> => {
    const toolCallNameMap = new Map<string, string>();
    messages.forEach((message) => {
      if (message.role === 'assistant' && message.tool_calls) {
        message.tool_calls.forEach((toolCall) => {
          if (toolCall.type === 'function') {
            toolCallNameMap.set(toolCall.id, toolCall.function.name);
          }
        });
      }
    });

    const pools = messages
      .filter((message) => message.role !== 'function')
      .map(async (msg) => await this.convertOAIMessagesToGoogleMessage(msg, toolCallNameMap));

    const contents = await Promise.all(pools);

    // 筛除空消息: contents.parts must not be empty.
    return contents.filter((content: Content) => content.parts && content.parts.length > 0);
  };

  private buildGoogleTools(
    tools: ChatCompletionTool[] | undefined,
    payload?: ChatStreamPayload,
  ): GoogleFunctionCallTool[] | undefined {
    const hasToolCalls = payload?.messages?.some((m) => m.tool_calls?.length);
    const hasSearch = payload?.enabledSearch;
    const hasUrlContext = payload?.urlContext;
    const hasFunctionTools = tools && tools.length > 0;

    // 如果已经有 tool_calls，优先处理 function declarations
    if (hasToolCalls && hasFunctionTools) {
      return this.buildFunctionDeclarations(tools);
    }

    // 构建并返回搜索相关工具（搜索工具不能与 FunctionCall 同时使用）
    if (hasUrlContext && hasSearch) {
      return [{ urlContext: {} }, { googleSearch: {} }];
    }
    if (hasUrlContext) {
      return [{ urlContext: {} }];
    }
    if (hasSearch) {
      return [{ googleSearch: {} }];
    }

    // 最后考虑 function declarations
    return this.buildFunctionDeclarations(tools);
  }

  private buildFunctionDeclarations(
    tools: ChatCompletionTool[] | undefined,
  ): GoogleFunctionCallTool[] | undefined {
    if (!tools || tools.length === 0) return;

    return [
      {
        functionDeclarations: tools.map((tool) => this.convertToolToGoogleTool(tool)),
      },
    ];
  }

  private convertToolToGoogleTool = (tool: ChatCompletionTool): FunctionDeclaration => {
    const functionDeclaration = tool.function;
    const parameters = functionDeclaration.parameters;
    // refs: https://github.com/lobehub/lobe-chat/pull/5002
    const properties =
      parameters?.properties && Object.keys(parameters.properties).length > 0
        ? parameters.properties
        : { dummy: { type: 'string' } }; // dummy property to avoid empty object

    return {
      description: functionDeclaration.description,
      name: functionDeclaration.name,
      parameters: {
        description: parameters?.description,
        properties: properties,
        required: parameters?.required,
        type: SchemaType.OBJECT,
      },
    };
  };
}

export default LobeGoogleAI;
