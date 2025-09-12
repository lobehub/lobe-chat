import { ChatMessage } from '@/types/message/chat';
import { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';

const isChatMessage = (message: ChatMessage | OpenAIChatMessage): message is ChatMessage =>
  'createdAt' in message;

const normalizeMessages = (messages: (ChatMessage | OpenAIChatMessage)[]): OpenAIChatMessage[] =>
  messages.map((message) => {
    if (isChatMessage(message)) {
      const role = message.role === 'supervisor' ? 'assistant' : message.role;

      return {
        content: message.content,
        role,
        tool_calls: message.tools,
      } as OpenAIChatMessage;
    }

    return message;
  });

export const chainSummaryTitle = (
  messages: (ChatMessage | OpenAIChatMessage)[],
  locale: string,
): Partial<ChatStreamPayload> => {
  const normalizedMessages = normalizeMessages(messages);

  return {
    messages: [
      {
        content: '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题',
        role: 'system',
      },
      {
        content: `${normalizedMessages
          .map((message) => `${message.role}: ${message.content}`)
          .join('\n')}

请总结上述对话为10个字以内的标题，不需要包含标点符号，输出语言语种为：${locale}`,
        role: 'user',
      },
    ],
  };
};
