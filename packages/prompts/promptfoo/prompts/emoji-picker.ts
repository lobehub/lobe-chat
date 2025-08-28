// TypeScript prompt wrapper that uses actual chain implementation
import type { OpenAIChatMessage } from '@lobechat/types';

import { chainPickEmoji } from '../../src/chains/pickEmoji';

interface PromptVars {
  messages: OpenAIChatMessage[];
}

export default function generatePrompt({ vars }: { vars: PromptVars }) {
  const { messages } = vars;

  // Convert messages to content string for emoji selection
  const content = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');

  // Use the actual chain function from src
  const result = chainPickEmoji(content);

  // Return messages array as expected by promptfoo
  return result.messages || [];
}
