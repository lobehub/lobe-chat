import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export interface LobeCloudflareParams {
    apiKey?: string;
    accountID?: string;
  }

export const LobeCloudflareAI = LobeOpenAICompatibleFactory({
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/v1`,
  chatCompletion: {
    handlePayload: (payload) => ({
      ...payload,
      stream: true,
    }),
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_CF_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Cloudflare,
});