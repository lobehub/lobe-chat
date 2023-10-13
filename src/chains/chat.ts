import { chatHelpers } from '@/store/session/helpers';
import { LanguageModel } from '@/types/llm';
import { OpenAIChatMessage, OpenAIChatStreamPayload } from '@/types/openai/chat';
import { Translate } from '@/types/translate';

export const chainSummaryTitle = async (
  messages: OpenAIChatMessage[],
): Promise<Partial<OpenAIChatStreamPayload>> => {
  const finalMessages: OpenAIChatMessage[] = [
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
  ];
  // 如果超过 4k，则使用 GPT3.5 16K 模型
  const tokens = await chatHelpers.getMessagesTokenCount(finalMessages);
  let model: LanguageModel | undefined = undefined;
  if (tokens > 4000) {
    model = LanguageModel.GPT3_5_16K;
  }

  return {
    messages: finalMessages,
    model,
  };
};

export const chainTranslate = (
  content: string,
  trans: Translate,
): Partial<OpenAIChatStreamPayload> => ({
  messages: [
    {
      content: '你是一名擅长翻译的助理，你需要将输入的语言翻译为目标语言',
      role: 'system',
    },
    {
      content: `请将以下内容 ${content}，翻译为 ${trans.to} `,
      role: 'user',
    },
  ],
});
