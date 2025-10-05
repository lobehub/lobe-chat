// TypeScript prompt wrapper that uses actual chain implementation
import { chainTranslate } from '@lobechat/prompts';

interface PromptVars {
  content: string;
  from: string;
  to: string;
}

export default function generatePrompt({ vars }: { vars: PromptVars }) {
  const { content, to } = vars;

  // Use the actual chain function from src
  const result = chainTranslate(content, to);

  // Return messages array as expected by promptfoo
  return result.messages || [];
}
