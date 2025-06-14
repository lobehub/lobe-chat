import type { VertexAI } from '@google-cloud/vertexai';
import {
  Content,
  FunctionCallPart,
  FunctionDeclaration,
  Tool as GoogleFunctionCallTool,
  GoogleGenerativeAI,
  GoogleSearchRetrievalTool,
  Part,
  SchemaType,
} from '@google/generative-ai';

import { imageUrlToBase64 } from '@/utils/imageToBase64';
import { safeParseJSON } from '@/utils/safeParseJSON';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../error';
import {
  ChatCompletionTool,
  ChatMethodOptions,
  ChatStreamPayload,
  OpenAIChatMessage,
  UserMessageContentPart,
} from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { GoogleGenerativeAIStream, VertexAIStream } from '../utils/streams';
import { parseDataUri } from '../utils/uriParser';

const modelsOffSafetySettings = new Set(['gemini-2.0-flash-exp']);

const modelsWithModalities = new Set([
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-preview-image-generation',
]);

const modelsDisableInstuction = new Set([
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-preview-image-generation',
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
  client?: GoogleGenerativeAI | VertexAI;
  id?: string;
  isVertexAi?: boolean;
}

interface GoogleAIThinkingConfig {
  includeThoughts?: boolean;
  thinkingBudget?: number;
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
  private client: GoogleGenerativeAI;
  private isVertexAi: boolean;
  baseURL?: string;
  apiKey?: string;
  provider: string;

  constructor({ apiKey, baseURL, client, isVertexAi, id }: LobeGoogleAIParams = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new GoogleGenerativeAI(apiKey);
    this.apiKey = apiKey;
    this.client = client ? (client as GoogleGenerativeAI) : new GoogleGenerativeAI(apiKey);
    this.baseURL = client ? undefined : baseURL || DEFAULT_BASE_URL;
    this.isVertexAi = isVertexAi || false;

    this.provider = id || (isVertexAi ? 'vertexai' : 'google');
  }

  async chat(rawPayload: ChatStreamPayload, options?: ChatMethodOptions) {
    try {
      const payload = this.buildPayload(rawPayload);
      const { model, thinking } = payload;

      const thinkingConfig: GoogleAIThinkingConfig = {
        includeThoughts:
          thinking?.type === 'enabled' ||
          (!thinking && model && (model.includes('-2.5-') || model.includes('thinking')))
            ? true
            : undefined,
        thinkingBudget:
          thinking?.type === 'enabled'
            ? (() => {
                const budget = thinking.budget_tokens;
                if (model.includes('-2.5-flash')) {
                  return Math.min(budget, 24_576);
                } else if (model.includes('-2.5-pro')) {
                  return Math.max(128, Math.min(budget, 32_768));
                }
                return Math.min(budget, 24_576);
              })()
            : thinking?.type === 'disabled'
              ? model.includes('-2.5-pro') ? 128 : 0
              : undefined,
      };

      const contents = await this.buildGoogleMessages(payload.messages);

      const inputStartAt = Date.now();

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

      const geminiStreamResult = await this.client
        .getGenerativeModel(
          {
            generationConfig: {
              maxOutputTokens: payload.max_tokens,
              // @ts-expect-error - Google SDK 0.24.0 doesn't have this property for now with
              response_modalities: modelsWithModalities.has(model) ? ['Text', 'Image'] : undefined,
              temperature: payload.temperature,
              topP: payload.top_p,
              ...(modelsDisableInstuction.has(model) || model.toLowerCase().includes('learnlm')
                ? {}
                : { thinkingConfig }),
            },
            model,
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
          },
          { apiVersion: 'v1beta', baseUrl: this.baseURL },
        )
        .generateContentStream(
          {
            contents,
            systemInstruction: modelsDisableInstuction.has(model)
              ? undefined
              : (payload.system as string),
            tools: this.buildGoogleTools(payload.tools, payload),
          },
          {
            signal: controller.signal,
          },
        );

      const googleStream = this.createEnhancedStream(geminiStreamResult.stream, controller.signal);
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
      const { errorType, error } = this.parseErrorMessage(err.message);

      throw AgentRuntimeError.chat({ error, errorType, provider: this.provider });
    }
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

      const { MODEL_LIST_CONFIGS, processModelList } = await import('../utils/modelParse');

      return processModelList(processedModels, MODEL_LIST_CONFIGS.google);
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
  ): Promise<Content> => {
    const content = message.content as string | UserMessageContentPart[];
    if (!!message.tool_calls) {
      return {
        parts: message.tool_calls.map<FunctionCallPart>((tool) => ({
          functionCall: {
            args: safeParseJSON(tool.function.arguments)!,
            name: tool.function.name,
          },
        })),
        role: 'function',
      };
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
    const pools = messages
      .filter((message) => message.role !== 'function')
      .map(async (msg) => await this.convertOAIMessagesToGoogleMessage(msg));

    return Promise.all(pools);
  };

  private parseErrorMessage(message: string): {
    error: any;
    errorType: ILobeAgentRuntimeErrorType;
  } {
    const defaultError = {
      error: { message },
      errorType: AgentRuntimeErrorType.ProviderBizError,
    };

    if (message.includes('location is not supported'))
      return { error: { message }, errorType: AgentRuntimeErrorType.LocationNotSupportError };

    const startIndex = message.lastIndexOf('[');
    if (startIndex === -1) {
      return defaultError;
    }

    try {
      // 从开始位置截取字符串到最后
      const jsonString = message.slice(startIndex);

      // 尝试解析 JSON 字符串
      const json: GoogleChatErrors = JSON.parse(jsonString);

      const bizError = json[0];

      switch (bizError.reason) {
        case 'API_KEY_INVALID': {
          return { ...defaultError, errorType: AgentRuntimeErrorType.InvalidProviderAPIKey };
        }

        default: {
          return { error: json, errorType: AgentRuntimeErrorType.ProviderBizError };
        }
      }
    } catch {
      //
    }

    const errorObj = this.extractErrorObjectFromError(message);

    const { errorDetails } = errorObj;

    if (errorDetails) {
      return { error: errorDetails, errorType: AgentRuntimeErrorType.ProviderBizError };
    }

    return defaultError;
  }

  private buildGoogleTools(
    tools: ChatCompletionTool[] | undefined,
    payload?: ChatStreamPayload,
  ): GoogleFunctionCallTool[] | undefined {
    // 目前 Tools (例如 googleSearch) 无法与其他 FunctionCall 同时使用
    if (payload?.messages?.some((m) => m.tool_calls?.length)) {
      return; // 若历史消息中已有 function calling，则不再注入任何 Tools
    }
    if (payload?.enabledSearch) {
      return [{ googleSearch: {} } as GoogleSearchRetrievalTool];
    }

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

  private extractErrorObjectFromError(message: string) {
    // 使用正则表达式匹配状态码部分 [数字 描述文本]
    const regex = /^(.*?)(\[\d+ [^\]]+])(.*)$/;
    const match = message.match(regex);

    if (match) {
      const prefix = match[1].trim();
      const statusCodeWithBrackets = match[2].trim();
      const message = match[3].trim();

      // 提取状态码数字
      const statusCodeMatch = statusCodeWithBrackets.match(/\[(\d+)/);
      const statusCode = statusCodeMatch ? parseInt(statusCodeMatch[1]) : null;

      // 创建包含状态码和消息的JSON
      const resultJson = {
        message: message,
        statusCode: statusCode,
        statusCodeText: statusCodeWithBrackets,
      };

      return {
        errorDetails: resultJson,
        prefix: prefix,
      };
    }

    // 如果无法匹配，返回原始消息
    return {
      errorDetails: null,
      prefix: message,
    };
  }
}

export default LobeGoogleAI;

type GoogleChatErrors = GoogleChatError[];

interface GoogleChatError {
  '@type': string;
  'domain': string;
  'metadata': {
    service: string;
  };
  'reason': string;
}
