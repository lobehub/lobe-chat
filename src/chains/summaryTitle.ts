import { ModelTokens } from '@/const/modelTokens';
import { chatHelpers } from '@/store/chat/helpers';
import { globalHelpers } from '@/store/global/helpers';
import { LanguageModel } from '@/types/llm';
import { OpenAIChatMessage, OpenAIChatStreamPayload } from '@/types/openai/chat';

export const chainSummaryTitle = async (
  messages: OpenAIChatMessage[],
): Promise<Partial<OpenAIChatStreamPayload>> => {
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
  let model: LanguageModel | undefined = undefined;
  if (tokens > ModelTokens[LanguageModel.GPT3_5]) {
    model = LanguageModel.GPT4_PREVIEW;
  }

  return {
    messages: finalMessages,
    model,
  };
};
