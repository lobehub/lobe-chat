import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { llmEnv } from '@/config/llm';

export interface LobeCloudflareParams {
    accountID?: string;
    apiKey?: string;
  }

export const LobeCloudflareAI = LobeOpenAICompatibleFactory({
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${llmEnv.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
  debug: {
    chatCompletion: () => process.env.DEBUG_CLOUDFLARE_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Cloudflare,
});