import { OpenAIChatStreamPayload } from '@/types/openai/chat';

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
