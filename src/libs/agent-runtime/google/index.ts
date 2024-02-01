import { Content, GoogleGenerativeAI, Part } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

import { ChatStreamPayload, UserMessageContentPart } from '@/types/openai/chat';

import { LobeRuntimeAI } from '../BaseAI';
import { ChatCompletionErrorPayload, ModelProvider } from '../types/type';
import { debugStream } from '../utils/debugStream';
import { DEBUG_CHAT_COMPLETION } from '../utils/env';
import { parseDataUri } from '../utils/uriParser';

export class LobeGoogleAI implements LobeRuntimeAI {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
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

  private convertOAIMessagesToGoogleMessage = (message: Message): Content => {
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
  private buildGoogleMessages = (messages: Message[]): Content[] =>
    messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((msg) => this.convertOAIMessagesToGoogleMessage(msg));

  async chat(payload: ChatStreamPayload) {
    try {
      const geminiStream = await this.client
        .getGenerativeModel({
          generationConfig: {
            maxOutputTokens: payload.max_tokens,
            temperature: payload.temperature,
            topP: payload.top_p,
          },
          model: payload.model,
        })
        .generateContentStream({
          contents: this.buildGoogleMessages(payload.messages as Message[]),
        });

      // Convert the response into a friendly text-stream
      const stream = GoogleGenerativeAIStream(geminiStream);

      const [debug, output] = stream.tee();

      if (DEBUG_CHAT_COMPLETION) {
        debugStream(debug).catch(console.error);
      }

      // Respond with the stream
      return new StreamingTextResponse(output);
    } catch (e) {
      const err = e as Error;

      const error: ChatCompletionErrorPayload = {
        error: err,
        errorType: 'OpenAIBizError',
        provider: ModelProvider.Google,
      };

      throw error;
    }
  }
}

export default LobeGoogleAI;
