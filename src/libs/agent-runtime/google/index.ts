import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

import { ChatStreamPayload } from '@/types/openai/chat';

import { LobeRuntimeAI } from '../BaseAI';
import { CompletionError, ModelProvider } from '../type';
import { debugStream } from '../utils/debugStream';
import { DEBUG_CHAT_COMPLETION } from '../utils/env';

export class LobeGoogleAI implements LobeRuntimeAI {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  // convert messages from the Vercel AI SDK Format to the format
  // that is expected by the Google GenAI SDK
  buildGoogleGenAIPrompt = (messages: Message[]) => ({
    contents: messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((message) => ({
        parts: [{ text: message.content }],
        role: message.role === 'user' ? 'user' : 'model',
      })),
  });

  async chat(payload: ChatStreamPayload) {
    try {
      const geminiStream = await this.client
        .getGenerativeModel({ model: 'gemini-pro' })
        .generateContentStream(this.buildGoogleGenAIPrompt(payload.messages as Message[]));

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

      const error: CompletionError = {
        error: err,
        errorType: 'OpenAIBizError',
        provider: ModelProvider.Google,
      };

      throw error;
    }
  }
}

export default LobeGoogleAI;
