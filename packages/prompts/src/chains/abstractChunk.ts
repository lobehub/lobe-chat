import { DEFAULT_MODEL } from '@/const/settings';
import { ChatStreamPayload } from '@/types/openai/chat';

export const chainAbstractChunkText = (text: string): Partial<ChatStreamPayload> => {
  return {
    messages: [
      {
        content:
          '你是一名擅长从 chunk 中提取摘要的助理，你需要将用户的会话总结为 1~2 句话的摘要，输出成 chunk 所使用的语种',
        role: 'system',
      },
      {
        content: `chunk: ${text}`,
        role: 'user',
      },
    ],
    model: DEFAULT_MODEL,
  };
};
