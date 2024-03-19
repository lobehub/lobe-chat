import { chatHelpers } from '@/store/chat/helpers';
import { globalHelpers } from '@/store/global/helpers';
import { ChatStreamPayload, OpenAIChatMessage } from '@/types/openai/chat';

export const chainSummaryTitle = async (
  messages: OpenAIChatMessage[],
): Promise<Partial<ChatStreamPayload>> => {
  const lang = globalHelpers.getCurrentLanguage();

  const finalMessages: OpenAIChatMessage[] = [
    {
      content: '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题',
      role: 'system',
    },
    {
      content: `${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}

请总结上述对话为10个字以内的标题，不需要包含标点符号，输出语言语种为：${lang}`,
      role: 'user',
    },
  ];
  // 如果超过 16k，则使用 GPT-4-turbo 模型
  const tokens = await chatHelpers.getMessagesTokenCount(finalMessages);
  let model: string | undefined = undefined;
  if (tokens > 16_000) {
    model = 'gpt-4-turbo-preview';
  }

  return {
    messages: finalMessages,
    model,
  };
};
