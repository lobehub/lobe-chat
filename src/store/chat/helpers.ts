import { LobeAgentConfig } from '@/types/agent';
import { ChatMessage } from '@/types/chatMessage';
import { OpenAIChatMessage } from '@/types/openai/chat';
import { encodeAsync } from '@/utils/tokenizer';

export const getMessagesTokenCount = async (messages: OpenAIChatMessage[]) =>
  encodeAsync(messages.map((m) => m.content).join(''));

const getSlicedMessagesWithConfig = (
  messages: ChatMessage[],
  config: LobeAgentConfig,
): ChatMessage[] => {
  // 如果没有开启历史消息数限制，或者限制为 0，则直接返回
  if (!config.enableHistoryCount || !config.historyCount) return messages;

  // 如果开启了，则返回尾部的N条消息
  return messages.reverse().slice(0, config.historyCount).reverse();
};

export const chatHelpers = {
  getMessagesTokenCount,
  getSlicedMessagesWithConfig,
};
