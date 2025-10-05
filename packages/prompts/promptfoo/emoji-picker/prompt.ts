// TypeScript prompt wrapper that uses actual chain implementation
import { chainPickEmoji } from '../../src/chains/pickEmoji';

interface PromptVars {
  content: string;
}

export default function generatePrompt({ vars }: { vars: PromptVars }) {
  const { content } = vars;

  // Use the actual chain function from src
  const result = chainPickEmoji(content);

  // Return messages array as expected by promptfoo
  return result.messages || [];
}
