import {
  Content,
  FunctionCallPart,
  FunctionDeclaration,
  Tool as GoogleFunctionCallTool,
  GoogleGenerativeAI,
  Part,
  SchemaType,
} from '@google/generative-ai';

import type { ChatModelCard } from '@/types/llm';
import { imageUrlToBase64 } from '@/utils/imageToBase64';
import { safeParseJSON } from '@/utils/safeParseJSON';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../error';
import {
  ChatCompetitionOptions,
  ChatCompletionTool,
  ChatStreamPayload,
  OpenAIChatMessage,
  UserMessageContentPart,
} from '../types';
import { ModelProvider } from '../types/type';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { GoogleGenerativeAIStream, convertIterableToStream } from '../utils/streams';
import { parseDataUri } from '../utils/uriParser';

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
  const useOFF = ['gemini-2.0-flash-exp'];
  if (useOFF.includes(model)) {
    return 'OFF' as HarmBlockThreshold; // https://discuss.ai.google.dev/t/59352
  }
  return HarmBlockThreshold.BLOCK_NONE;
}

const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com';

export class LobeGoogleAI implements LobeRuntimeAI {
  private client: GoogleGenerativeAI;
  baseURL?: string;
  apiKey?: string;

  constructor({ apiKey, baseURL }: { apiKey?: string; baseURL?: string } = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new GoogleGenerativeAI(apiKey);
    this.baseURL = baseURL || DEFAULT_BASE_URL;
    this.apiKey = apiKey;
  }

  async chat(rawPayload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const payload = this.buildPayload(rawPayload);
      const model = payload.model;

      const contents = await this.buildGoogleMessages(payload.messages, model);

      const geminiStreamResult = await this.client
        .getGenerativeModel(
          {
            generationConfig: {
              maxOutputTokens: payload.max_tokens,
              temperature: payload.temperature,
              topP: payload.top_p,
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
        .generateContentStream({
          contents,
          systemInstruction: payload.system as string,
          tools: this.buildGoogleTools(payload.tools),
        });

      const googleStream = convertIterableToStream(geminiStreamResult.stream);
      const [prod, useForDebug] = googleStream.tee();

      if (process.env.DEBUG_GOOGLE_CHAT_COMPLETION === '1') {
        debugStream(useForDebug).catch();
      }

      // Convert the response into a friendly text-stream
      const stream = GoogleGenerativeAIStream(prod, options?.callback);

      // Respond with the stream
      return StreamingResponse(stream, { headers: options?.headers });
    } catch (e) {
      const err = e as Error;

      const { errorType, error } = this.parseErrorMessage(err.message);

      throw AgentRuntimeError.chat({ error, errorType, provider: ModelProvider.Google });
    }
  }

  async models() {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const url = `${this.baseURL}/v1beta/models?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    const json = await response.json();

    const modelList: GoogleModelCard[] = json['models'];

    return modelList
      .map((model) => {
        const modelName = model.name.replace(/^models\//, '');

        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => modelName.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: model.inputTokenLimit + model.outputTokenLimit,
          displayName: model.displayName,
          enabled: knownModel?.enabled || false,
          functionCall:
            modelName.toLowerCase().includes('gemini') && !modelName.toLowerCase().includes('thinking')
            || knownModel?.abilities?.functionCall
            || false,
          id: modelName,
          reasoning:
            modelName.toLowerCase().includes('thinking')
            || knownModel?.abilities?.reasoning
            || false,
          vision:
            modelName.toLowerCase().includes('vision')
            || (modelName.toLowerCase().includes('gemini') && !modelName.toLowerCase().includes('gemini-1.0'))
            || knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
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
  private convertContentToGooglePart = async (content: UserMessageContentPart): Promise<Part> => {
    switch (content.type) {
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

    return {
      parts:
        typeof content === 'string'
          ? [{ text: content }]
          : await Promise.all(content.map(async (c) => await this.convertContentToGooglePart(c))),
      role: message.role === 'assistant' ? 'model' : 'user',
    };
  };

  // convert messages from the OpenAI format to Google GenAI SDK
  private buildGoogleMessages = async (
    messages: OpenAIChatMessage[],
    model: string,
  ): Promise<Content[]> => {
    // if the model is gemini-1.0 we need to pair messages
    if (model.startsWith('gemini-1.0')) {
      const contents: Content[] = [];
      let lastRole = 'model';

      for (const message of messages) {
        // current to filter function message
        if (message.role === 'function') {
          continue;
        }
        const googleMessage = await this.convertOAIMessagesToGoogleMessage(message);

        // if the last message is a model message and the current message is a model message
        // then we need to add a user message to separate them
        if (lastRole === googleMessage.role) {
          contents.push({ parts: [{ text: '' }], role: lastRole === 'user' ? 'model' : 'user' });
        }

        // add the current message to the contents
        contents.push(googleMessage);

        // update the last role
        lastRole = googleMessage.role;
      }

      // if the last message is a user message, then we need to add a model message to separate them
      if (lastRole === 'model') {
        contents.push({ parts: [{ text: '' }], role: 'user' });
      }

      return contents;
    }

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

    try {
      const startIndex = message.lastIndexOf('[');
      if (startIndex === -1) {
        return defaultError;
      }

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
      // 如果解析失败，则返回原始错误消息
      return defaultError;
    }
  }

  private buildGoogleTools(
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

type GoogleChatErrors = GoogleChatError[];

interface GoogleChatError {
  '@type': string;
  'domain': string;
  'metadata': {
    service: string;
  };
  'reason': string;
}
