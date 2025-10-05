// TypeScript prompt wrapper that uses actual chain implementation
import { chainAnswerWithContext } from '@lobechat/prompts';

interface PromptVars {
  context: string | string[];
  knowledge?: string | string[];
  query: string;
}

export default function generatePrompt({ vars }: { vars: PromptVars }) {
  const { context, query, knowledge = ['general knowledge'] } = vars;

  // Ensure context and knowledge are arrays
  const contextArray = Array.isArray(context) ? context : [context];
  const knowledgeArray = Array.isArray(knowledge) ? knowledge : [knowledge];

  // Use the actual chain function from src
  const result = chainAnswerWithContext({
    context: contextArray,
    knowledge: knowledgeArray,
    question: query,
  });

  // Return messages array as expected by promptfoo
  return result.messages || [];
}
