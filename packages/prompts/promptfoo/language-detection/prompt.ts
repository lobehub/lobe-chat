// TypeScript prompt wrapper that uses actual chain implementation
import { chainLangDetect } from '@lobechat/prompts';

interface PromptVars {
  content: string;
}

export default function generatePrompt({ vars }: { vars: PromptVars }) {
  const { content } = vars;

  // Use the actual chain function from src
  const result = chainLangDetect(content);

  // Return messages array as expected by promptfoo
  return result.messages || [];
}
