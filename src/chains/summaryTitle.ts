import { globalHelpers } from '@/store/user/helpers';
import { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';

export const chainSummaryTitle = (messages: OpenAIChatMessage[]): Partial<ChatStreamPayload> => {
  const lang = globalHelpers.getCurrentLanguage();

  return {
    messages: [
      {
        content: '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题，并且在标题前面放一个合适的可以代表该会话内容的emoji',
        role: 'system',
      },
      {
        content: `${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}

请总结上述对话为10个字以内的标题，不需要包含标点符号，并且在标题前面放一个合适的可以代表该会话内容的emoji，输出语言语种为：${lang}`,
        role: 'user',
      },
    ],
  };
};
