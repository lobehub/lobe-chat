import { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';

export const chainSummaryTitle = (
  messages: OpenAIChatMessage[],
  locale: string,
): Partial<ChatStreamPayload> => {
  return {
    messages: [
      {
        content: '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题',
        role: 'system',
      },
      {
        content: `${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}

请总结上述对话为10个字以内的标题，不需要包含标点符号，输出语言语种为：${locale}`,
        role: 'user',
      },
    ],
  };
};
