import { LobeAgentConfig } from '@/types/agent';
import { ChatMessage } from '@/types/chatMessage';
import { OpenAIChatMessage } from '@/types/openai/chat';
import { encodeAsync } from '@/utils/tokenizer';

export const getMessagesTokenCount = async (messages: OpenAIChatMessage[]) =>
  encodeAsync(messages.map((m) => m.content).join(''));

export const getMessageById = (messages: ChatMessage[], id: string) =>
  messages.find((m) => m.id === id);

const getSlicedMessagesWithConfig = (
  messages: ChatMessage[],
  config: LobeAgentConfig,
): ChatMessage[] => {
  // if historyCount is not enabled or set to 0, return all messages
  if (!config.enableHistoryCount || !config.historyCount) return messages;

  // if historyCount is negative, return empty array
  if (config.historyCount <= 0) return [];

  // if historyCount is positive, return last N messages
  return messages.slice(-config.historyCount);
};

export const chatHelpers = {
  getMessageById,
  getMessagesTokenCount,
  getSlicedMessagesWithConfig,
};
