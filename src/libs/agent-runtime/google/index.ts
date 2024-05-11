import {
  Content,
  FunctionDeclaration,
  FunctionDeclarationSchemaProperty,
  FunctionDeclarationSchemaType,
  Tool as GoogleFunctionCallTool,
  GoogleGenerativeAI,
  Part,
} from '@google/generative-ai';
import { JSONSchema7 } from 'json-schema';
import { transform } from 'lodash-es';

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
import { GoogleGenerativeAIStream, googleGenAIResultToStream } from '../utils/streams';
import { parseDataUri } from '../utils/uriParser';

enum HarmCategory {
  HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT',
  HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
  HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
  HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
}

enum HarmBlockThreshold {
  BLOCK_NONE = 'BLOCK_NONE',
}

export class LobeGoogleAI implements LobeRuntimeAI {
  private client: GoogleGenerativeAI;
  baseURL?: string;

  constructor({ apiKey, baseURL }: { apiKey?: string; baseURL?: string }) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidGoogleAPIKey);

    this.client = new GoogleGenerativeAI(apiKey);
    this.baseURL = baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const model = this.convertModel(payload.model, payload.messages);

      const contents = this.buildGoogleMessages(payload.messages, model);

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
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
            ],
          },
          { apiVersion: 'v1beta', baseUrl: this.baseURL },
        )
        .generateContentStream({ contents, tools: this.buildGoogleTools(payload.tools) });

      const googleStream = googleGenAIResultToStream(geminiStreamResult);
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

  private convertContentToGooglePart = (content: UserMessageContentPart): Part => {
    switch (content.type) {
      case 'text': {
        return { text: content.text };
      }
      case 'image_url': {
        const { mimeType, base64 } = parseDataUri(content.image_url.url);

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
    }
  };

  private convertOAIMessagesToGoogleMessage = (message: OpenAIChatMessage): Content => {
    const content = message.content as string | UserMessageContentPart[];

    return {
      parts:
        typeof content === 'string'
          ? [{ text: content }]
          : content.map((c) => this.convertContentToGooglePart(c)),
      role: message.role === 'assistant' ? 'model' : 'user',
    };
  };

  // convert messages from the Vercel AI SDK Format to the format
  // that is expected by the Google GenAI SDK
  private buildGoogleMessages = (messages: OpenAIChatMessage[], model: string): Content[] => {
    // if the model is gemini-1.5-pro-latest, we don't need any special handling
    if (model === 'gemini-1.5-pro-latest') {
      return messages
        .filter((message) => message.role !== 'function')
        .map((msg) => this.convertOAIMessagesToGoogleMessage(msg));
    }

    const contents: Content[] = [];
    let lastRole = 'model';

    messages.forEach((message) => {
      // current to filter function message
      if (message.role === 'function') {
        return;
      }
      const googleMessage = this.convertOAIMessagesToGoogleMessage(message);

      // if the last message is a model message and the current message is a model message
      // then we need to add a user message to separate them
      if (lastRole === googleMessage.role) {
        contents.push({ parts: [{ text: '' }], role: lastRole === 'user' ? 'model' : 'user' });
      }

      // add the current message to the contents
      contents.push(googleMessage);

      // update the last role
      lastRole = googleMessage.role;
    });

    // if the last message is a user message, then we need to add a model message to separate them
    if (lastRole === 'model') {
      contents.push({ parts: [{ text: '' }], role: 'user' });
    }

    return contents;
  };

  private convertModel = (model: string, messages: OpenAIChatMessage[]) => {
    let finalModel: string = model;

    if (model.includes('pro-vision')) {
      // if message are all text message, use vision will return an error:
      // "[400 Bad Request] Add an image to use models/gemini-pro-vision, or switch your model to a text model."
      const noNeedVision = messages.every((m) => typeof m.content === 'string');

      // so we need to downgrade to gemini-pro
      if (noNeedVision) finalModel = 'gemini-pro';
    }

    return finalModel;
  };

  private parseErrorMessage(message: string): {
    error: any;
    errorType: ILobeAgentRuntimeErrorType;
  } {
    const defaultError = {
      error: { message },
      errorType: AgentRuntimeErrorType.GoogleBizError,
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
          return { ...defaultError, errorType: AgentRuntimeErrorType.InvalidGoogleAPIKey };
        }

        default: {
          return { error: json, errorType: AgentRuntimeErrorType.GoogleBizError };
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

    return {
      description: functionDeclaration.description,
      name: functionDeclaration.name,
      parameters: {
        description: parameters?.description,
        properties: transform(parameters?.properties, (result, value, key: string) => {
          result[key] = this.convertSchemaObject(value as JSONSchema7);
        }),
        required: parameters?.required,
        type: FunctionDeclarationSchemaType.OBJECT,
      },
    };
  };

  private convertSchemaObject(schema: JSONSchema7): FunctionDeclarationSchemaProperty {
    switch (schema.type) {
      default:
      case 'object': {
        return {
          ...schema,
          properties: Object.fromEntries(
            Object.entries(schema.properties || {}).map(([key, value]) => [
              key,
              this.convertSchemaObject(value as JSONSchema7),
            ]),
          ),
          type: FunctionDeclarationSchemaType.OBJECT,
        } as any;
      }

      case 'array': {
        return {
          ...schema,
          items: this.convertSchemaObject(schema.items as JSONSchema7),
          type: FunctionDeclarationSchemaType.ARRAY,
        } as any;
      }

      case 'string': {
        return { ...schema, type: FunctionDeclarationSchemaType.STRING } as any;
      }

      case 'number': {
        return { ...schema, type: FunctionDeclarationSchemaType.NUMBER } as any;
      }

      case 'boolean': {
        return { ...schema, type: FunctionDeclarationSchemaType.BOOLEAN } as any;
      }
    }
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
