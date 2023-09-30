import { OpenAIChatMessage } from '@/types/openai';
import { encodeAsync } from '@/utils/tokenizer';

export const getMessagesTokenCount = async (messages: OpenAIChatMessage[]) =>
  encodeAsync(messages.map((m) => m.content).join(''));

export const chatHelpers = {
  getMessagesTokenCount,
};
