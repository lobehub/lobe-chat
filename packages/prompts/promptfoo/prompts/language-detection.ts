// TypeScript prompt wrapper that uses actual chain implementation
import { chainLangDetect } from '../../src/chains/langDetect';

interface PromptVars {
  text: string;
}

export default function generatePrompt({ vars }: { vars: PromptVars }) {
  const { text } = vars;

  // Use the actual chain function from src
  const result = chainLangDetect(text);

  // Return messages array as expected by promptfoo
  return result.messages || [];
}
