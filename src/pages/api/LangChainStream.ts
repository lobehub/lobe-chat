import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';

import { LangChainParams } from '@/types/langchain';

const isDev = process.env.NODE_ENV === 'development';
const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL;

export function LangChainStream(payload: LangChainParams) {
  const { prompts, vars, llm } = payload;

  // 将 payload 中的消息转换为 ChatOpenAI 所需的 HumanChatMessage、SystemChatMessage 和 AIChatMessage 类型
  const chatPrompt = ChatPromptTemplate.fromPromptMessages(
    prompts.map((m) => {
      switch (m.role) {
        default:
        case 'user': {
          return HumanMessagePromptTemplate.fromTemplate(m.content);
        }
        case 'system': {
          return SystemMessagePromptTemplate.fromTemplate(m.content);
        }

        case 'assistant': {
          return AIMessagePromptTemplate.fromTemplate(m.content);
        }
      }
    }),
  );

  // 使用 TextEncoder 将字符串转换为字节数组，以便在 ReadableStream 中发送
  const encoder = new TextEncoder();

  // 初始化换行符计数器

  return new ReadableStream({
    async start(controller) {
      let newlineCounter = 0;

      const chat = new ChatOpenAI(
        {
          streaming: true,
          ...llm,

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
          // 暂时设定不重试 ，后续看是否需要支持重试
          maxRetries: 0,
        },
        isDev && OPENAI_PROXY_URL ? { basePath: OPENAI_PROXY_URL } : undefined,
      );

      const chain = new LLMChain({
        callbacks: [
          {
            handleChainError(err: Error): Promise<void> | void {
              console.log(err.message);
            },
          },
        ],
        llm: chat,
        prompt: chatPrompt,
        verbose: true,
      });
      try {
        // 使用转换后的聊天消息作为输入开始聊天
        await chain.call(vars);
        // 完成后，关闭流
        controller.close();
      } catch (error) {
        // 如果在执行过程中发生错误，向流发送错误
        controller.error(error);
      }
    },
  });
}
