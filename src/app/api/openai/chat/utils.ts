import { AIMessage, FunctionMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';

import { OpenAIChatMessage } from '@/types/openai/chat';

export const mapToLangChainMessages = (messages: OpenAIChatMessage[]) =>
  messages.map((message) => {
    switch (message.role) {
      default:
      case 'user': {
        return new HumanMessage({ content: message.content });
      }

      case 'system': {
        return new SystemMessage({ content: message.content });
      }

      case 'assistant': {
        return new AIMessage({ content: message.content, name: message.name });
      }

      case 'function': {
        return new FunctionMessage({ content: message.content, name: message.name! });
      }
    }
  });
