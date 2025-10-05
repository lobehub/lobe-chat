import { ChatStreamPayload } from '@lobechat/types';

interface AnswerWithContext {
  context: string[];
  knowledge: string[];
  question: string;
}
export const chainAnswerWithContext = ({
  context,
  knowledge,
  question,
}: AnswerWithContext): Partial<ChatStreamPayload> => {
  const filteredContext = context.filter((c) => c.trim());
  const hasContext = filteredContext.length > 0;

  return {
    messages: [
      {
        content: hasContext
          ? `You are a helpful assistant specialized in ${knowledge.join('/')}. Your task is to answer questions based on the provided context passages.

IMPORTANT RULES:
- Prioritize information from the provided context passages
- If the context is about a different topic than the question, clearly state "The provided context does not contain information about this topic" and do NOT use your general knowledge
- If the context contains relevant information, use it to answer
- Answer in the same language as the question
- Use markdown formatting for better readability

The provided context passages:

<context>
${filteredContext.join('\n')}
</context>

Question to answer:

${question}`
          : `You are a helpful assistant specialized in ${knowledge.join('/')}. Please answer the following question using your knowledge.

Answer in the same language as the question and use markdown formatting for better readability.

Question to answer:

${question}`,
        role: 'user',
      },
    ],
  };
};
