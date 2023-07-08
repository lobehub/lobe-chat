import { OpenAIChatMessage } from '@/types/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { AIChatMessage, HumanChatMessage, SystemChatMessage } from 'langchain/schema';

const isDev = process.env.NODE_ENV === 'development';
const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL;

/**
 * @title OpenAI Stream Payload
 */
export interface OpenAIStreamPayload {
  /**
   * @title 模型名称
   */
  model: string;
  /**
   * @title 聊天信息列表
   */
  messages: OpenAIChatMessage[];
  /**
   * @title 生成文本的随机度量，用于控制文本的创造性和多样性
   * @default 0.5
   */
  temperature: number;
  /**
   * @title 控制生成文本中最高概率的单个令牌
   * @default 1
   */
  top_p?: number;
  /**
   * @title 控制生成文本中的惩罚系数，用于减少重复性
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * @title 控制生成文本中的惩罚系数，用于减少主题的变化
   * @default 0
   */
  presence_penalty?: number;
  /**
   * @title 生成文本的最大长度
   */
  max_tokens?: number;
  /**
   * @title 是否开启流式请求
   * @default true
   */
  stream?: boolean;
  /**
   * @title 返回的文本数量
   */
  n?: number;
}

export function OpenAIStream(payload: OpenAIStreamPayload) {
  const { messages, ...params } = payload;

  // 将 payload 中的消息转换为 ChatOpenAI 所需的 HumanChatMessage、SystemChatMessage 和 AIChatMessage 类型
  const chatMessages = messages.map((m) => {
    switch (m.role) {
      default:
      case 'user':
        return new HumanChatMessage(m.content);
      case 'system':
        return new SystemChatMessage(m.content);

      case 'assistant':
        return new AIChatMessage(m.content);
    }
  });

  // 使用 TextEncoder 将字符串转换为字节数组，以便在 ReadableStream 中发送
  const encoder = new TextEncoder();

  // 初始化换行符计数器

  return new ReadableStream({
    async start(controller) {
      let newlineCounter = 0;

      const chat = new ChatOpenAI(
        {
          streaming: true,
          ...params,
          // 暂时设定不重试 ，后续看是否需要支持重试
          maxRetries: 0,
          verbose: true,
          callbacks: [
            {
              handleLLMNewToken(token) {
                // 如果 message 是换行符，且 newlineCounter 小于 2，那么跳过该换行符
                if (newlineCounter < 2 && token === '\n') {
                  return;
                }

                // 将 message 编码为字节并添加到流中
                const queue = encoder.encode(token);
                controller.enqueue(queue);
                newlineCounter++;
              },
            },
          ],
        },
        isDev && OPENAI_PROXY_URL ? { basePath: OPENAI_PROXY_URL } : undefined,
      );

      try {
        // 使用转换后的聊天消息作为输入开始聊天
        await chat.call(chatMessages);
        // 完成后，关闭流
        controller.close();
      } catch (error) {
        // 如果在执行过程中发生错误，向流发送错误
        controller.error(error);
      }
    },
  });
}
