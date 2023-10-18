import { OpenAIChatStreamPayload } from '@/types/openai/chat';

/**
 * pick emoji for user prompt
 * @param content
 */
export const chainPickEmoji = (content: string): Partial<OpenAIChatStreamPayload> => ({
  messages: [
    {
      content: '你是一名非常懂设计与时尚的设计师，你需要从用户的描述中匹配一个合适的 emoji。',
      role: 'system',
    },
    {
      content: `输入:你是一名精通体验设计的设计系统设计师，设计系统存在诸多类别的 token，比如品牌色、成功色等，你需要为各个类别的 token 提供说明文案。`,
      role: 'user',
    },
    {
      content: `💅`,
      role: 'assistant',
    },
    {
      content: `输入:用户会输入一串 ts 代码，为了确保所有功能和分支的 100% 的覆盖率，你需要给出需要考虑哪些数据场景。`,
      role: 'user',
    },
    {
      content: `🧪`,
      role: 'assistant',
    },
    {
      content: `输入:${content}`,
      role: 'user',
    },
  ],
});
