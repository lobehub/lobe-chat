import { ModelProvider } from 'model-bank';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { ChatStreamPayload, OpenAIChatMessage } from '../../types';

/**
 * Poe API provider
 * - Uses OpenAI-compatible endpoints
 * - Maps 'assistant' role to 'bot' role for compatibility
 * - Maps 'tool' role to 'user' role with formatted content
 */
export const LobePoeAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.poe.com/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      // Transform messages to use Poe-compatible roles
      const transformedMessages = payload.messages.map((message: OpenAIChatMessage) => {
        if (message.role === 'assistant') {
          return {
            ...message,
            role: 'bot',
          };
        }
        
        // Handle tool role - Poe doesn't support tool role, so format as user message
        if (message.role === 'tool') {
          return {
            ...message,
            role: 'user',
            content: typeof message.content === 'string' 
              ? `Tool Result: ${message.content}`
              : message.content,
          };
        }
        
        return message;
      });

      return {
        ...payload,
        messages: transformedMessages,
        stream: payload.stream ?? true,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_POE_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Poe,
});