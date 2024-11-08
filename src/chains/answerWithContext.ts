import { ChatStreamPayload } from '@/types/openai/chat';

export const chainAnswerWithContext = ({
  context,
  knowledge,
  question,
}: {
  context: string[];
  knowledge: string[];
  question: string;
}): Partial<ChatStreamPayload> => ({
  messages: [
    {
      content: `You are also a helpful assistant good answering questions related to ${knowledge.join('/')}. And you'll be provided with a question and several passages that might be relevant. And currently your task is to provide answer based on the question and passages.

Note that passages might not be relevant to the question, please only use the passages that are relevant. Or if there is no relevant passage, please answer using your knowledge.

Answer should use the same original language as the question and follow markdown syntax.

The provided passages as context:

<Context>
${context.join('\n')}
</Context>

The question to answer is:

${question}
`,
      role: 'user',
    },
  ],
});
