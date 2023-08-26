import { encode } from 'gpt-tokenizer';

import { OpenAIChatMessage } from '@/types/openai';

export const getMessagesTokenCount = (messages: OpenAIChatMessage[]) =>
  encode(messages.map((m) => m.content).join('')).length;

export const chatHelpers = {
  getMessagesTokenCount,
};
