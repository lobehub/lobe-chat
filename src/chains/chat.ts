import { chatHelpers } from '@/store/session/helpers';
import { LanguageModel } from '@/types/llm';
import { OpenAIChatMessage, OpenAIChatStreamPayload } from '@/types/openai/chat';

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
  targetLang: string,
): Partial<OpenAIChatStreamPayload> => ({
  messages: [
    {
      content: '你是一名擅长翻译的助理，你需要将输入的语言翻译为目标语言',
      role: 'system',
    },
    {
      content: `请将以下内容 ${content}，翻译为 ${targetLang} `,
      role: 'user',
    },
  ],
});
export const chainLangDetect = (content: string): Partial<OpenAIChatStreamPayload> => ({
  messages: [
    {
      content:
        '你是一名精通全世界语言的语言专家，你需要识别用户输入的内容，以国际标准 locale 进行输出',
      role: 'system',
    },
    {
      content: '{你好}',
      role: 'user',
    },
    {
      content: 'zh-CN',
      role: 'assistant',
    },
    {
      content: '{hello}',
      role: 'user',
    },
    {
      content: 'en-US',
      role: 'assistant',
    },
    {
      content: `{${content}}`,
      role: 'user',
    },
  ],
});
