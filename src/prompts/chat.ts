import { OpenAIChatMessage, OpenAIStreamPayload } from '@/types/openai';

export const promptSummaryTitle = (
  messages: OpenAIChatMessage[],
): Partial<OpenAIStreamPayload> => ({
  messages: [
    {
      content:
        '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题，不需要包含标点符号',
      role: 'system',
    },
    {
      content: `${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}

请总结上述对话为10个字以内的标题，不需要包含标点符号`,
      role: 'user',
    },
  ],
});

export const promptSummaryDescription = (
  messages: OpenAIChatMessage[],
): Partial<OpenAIStreamPayload> => ({
  messages: [
    {
      content: '你是一名擅长会话的助理，你需要将用户的会话做一个3句话以内的总结。',
      role: 'system',
    },
    {
      content: `${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}

请总结上述对话内容，不超过 50 个字。`,
      role: 'user',
    },
  ],
});
