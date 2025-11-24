// TypeScript prompt wrapper that uses actual chain implementation
import { chainAbstractChunkText } from '@lobechat/prompts';

interface PromptVars {
  text: string;
}

export default function generatePrompt({ vars }: { vars: PromptVars }) {
  const { text } = vars;

  // Use the actual chain function from src
  const result = chainAbstractChunkText(text);

  // Return messages array as expected by promptfoo
  return result.messages || [];
}
