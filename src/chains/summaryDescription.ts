import { OpenAIChatStreamPayload } from '@/types/openai/chat';

export const chainSummaryDescription = (content: string): Partial<OpenAIChatStreamPayload> => ({
  messages: [
    {
      content:
        '你是一名擅长会话的助理，你需要将用户的输入的内容总结为一个专家的简介，不超过 20 个字',
      role: 'system',
    },
    {
      content: `${content}`,
      role: 'user',
    },
  ],
});
