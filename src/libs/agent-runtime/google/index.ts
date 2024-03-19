import { Content, GoogleGenerativeAI, Part } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../error';
import {
  ChatCompetitionOptions,
  ChatStreamPayload,
  OpenAIChatMessage,
  UserMessageContentPart,
} from '../types';
import { ModelProvider } from '../types/type';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { parseDataUri } from '../utils/uriParser';

type GoogleChatErrors = GoogleChatError[];

interface GoogleChatError {
  '@type': string;
  'domain': string;
  'metadata': {
    service: string;
  };
  'reason': string;
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

export class LobeGoogleAI implements LobeRuntimeAI {
  private client: GoogleGenerativeAI;

  constructor({ apiKey }: { apiKey?: string }) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidGoogleAPIKey);

    this.client = new GoogleGenerativeAI(apiKey);
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const { contents, model } = this.buildGoogleMessages(payload.messages, payload.model);
      const geminiStream = await this.client
        .getGenerativeModel({
          generationConfig: {
            maxOutputTokens: payload.max_tokens,
            temperature: payload.temperature,
            topP: payload.top_p,
          },
          model,
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
        })
        .generateContentStream({ contents });

      // Convert the response into a friendly text-stream
      const stream = GoogleGenerativeAIStream(geminiStream, options?.callback);

      const [debug, output] = stream.tee();

      if (process.env.DEBUG_GOOGLE_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
      }

      // Respond with the stream
      return new StreamingTextResponse(output, { headers: options?.headers });
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
      role: message.role === 'user' ? 'user' : 'model',
    };
  };

  // convert messages from the Vercel AI SDK Format to the format
  // that is expected by the Google GenAI SDK
  private buildGoogleMessages = (
    messages: OpenAIChatMessage[],
    model: string,
  ): { contents: Content[]; model: string } => {
    const contents = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((msg) => this.convertOAIMessagesToGoogleMessage(msg));

    // if message are all text message, use vision will return error
    // use add an image to use models/gemini-pro-vision, or switch your model to a text model
    const noImage = messages.every((m) => typeof m.content === 'string');

    return { contents, model: noImage ? 'gemini-pro' : model };
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
}

export default LobeGoogleAI;
