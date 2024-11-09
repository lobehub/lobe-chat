import { LobeAgentChatConfig } from '@/types/agent';
import { ChatMessage } from '@/types/message';
import { OpenAIChatMessage } from '@/types/openai/chat';
import { encodeAsync } from '@/utils/tokenizer';

export const getMessagesTokenCount = async (messages: OpenAIChatMessage[]) =>
  encodeAsync(messages.map((m) => m.content).join(''));

export const getMessageById = (messages: ChatMessage[], id: string) =>
  messages.find((m) => m.id === id);

const getSlicedMessagesWithConfig = (
  messages: ChatMessage[],
  config: LobeAgentChatConfig,
  includeNewUserMessage?: boolean,
): ChatMessage[] => {
  // if historyCount is not enabled or set to 0, return all messages
  if (!config.enableHistoryCount || !config.historyCount) return messages;

  // if user send message, history will include this message so the total length should +1
  const messagesCount = !!includeNewUserMessage ? config.historyCount + 1 : config.historyCount;

  // if historyCount is negative, return empty array
  if (messagesCount <= 0) return [];

  // if historyCount is positive, return last N messages
  return messages.slice(-messagesCount);
};

export const chatHelpers = {
  getMessageById,
  getMessagesTokenCount,
  getSlicedMessagesWithConfig,
};
