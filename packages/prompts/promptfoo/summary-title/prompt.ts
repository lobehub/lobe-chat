// TypeScript prompt wrapper that uses actual chain implementation
import { chainSummaryTitle } from '@lobechat/prompts';
import type { OpenAIChatMessage } from '@lobechat/types';

interface PromptVars {
  locale: string;
  messages: OpenAIChatMessage[];
}

export default function generatePrompt({ vars }: { vars: PromptVars }) {
  const { messages, locale } = vars;

  // Use the actual chain function from src
  const result = chainSummaryTitle(messages, locale);

  // Return messages array as expected by promptfoo
  return result.messages || [];
}
