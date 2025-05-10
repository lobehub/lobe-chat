import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

/**
 * Pollinations.AI implementation
 * Uses the OpenAI-compatible API endpoint
 */
export const LobePollinationsAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://text.pollinations.ai/openai',
  defaultModel: 'openai',
  name: 'pollinations',
});

export default LobePollinationsAI;
