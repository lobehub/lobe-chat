import { ChatStreamPayload } from '@/types/openai/chat';

export const chainRewriteQuery = (
  query: string,
  context: string[],
): Partial<ChatStreamPayload> => ({
  messages: [
    {
      content: `Given the following conversation and a follow-up question, rephrase the follow up question to be a standalone question, in its original language. Keep as much details as possible from previous messages. Keep entity names and all.

<chatHistory>
${context.join('\n')}
</chatHistory>
`,
      role: 'system',
    },
    {
      content: `Follow Up Input: ${query}, it's standalone query:`,
      role: 'user',
    },
  ],
});
