import { ChatStreamPayload } from '@/types/index';

export interface AutoCompleteParams {
  /**
   * Optional conversation context
   */
  context?: string[];
  /**
   * Current partial input from user
   */
  input: string;
}

export const contextInputAutoComplete = ({
  input,
  context = [],
}: AutoCompleteParams): Partial<ChatStreamPayload> => {
  const hasContext = context.length > 0;

  return {
    messages: [
      {
        content: `You predict what the user will TYPE next, like search box autocomplete.

Task: Complete the text with 3-8 words the user would naturally type next.

✅ CORRECT examples:
Input: "How to install"
Output: "Node.js on Mac"

Input: "请帮我"
Output: "写一个函数"

Input: "3rd-devs 是"
Output: "什么项目"

❌ WRONG examples (DON'T DO THIS):
Input: "医疗"
Output: "领域的FHIR标准评估确实是promptfoo最专业的..." ← NO! This is answering!

Input: "3rd-devs 是"
Output: "一个典型的企业级AI代理开发平台，它通过..." ← NO! This is explaining!

Input: "有哪些工具"
Output: "有很多工具可以使用，比如..." ← NO! This is responding!

Rule: If it sounds like you're answering or explaining, STOP. Just predict typing.
${hasContext ? '\nUse context for better prediction, but keep it SHORT.' : ''}`,
        role: 'system',
      },
      {
        content: 'Predict what user types: "Can you help me"',
        role: 'user',
      },
      {
        content: 'with this problem',
        role: 'assistant',
      },
      {
        content: 'Predict what user types: "我想要"',
        role: 'user',
      },
      {
        content: '学习 Python',
        role: 'assistant',
      },
      ...(hasContext
        ? [
            {
              content: `Context:\n${context.join('\n')}`,
              role: 'user' as const,
            },
          ]
        : []),
      {
        content: `Predict what user types: "${input}"`,
        role: 'user',
      },
    ],
  };
};
