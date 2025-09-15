import { ModelRuntime } from '@lobechat/model-runtime';

import { createPayloadWithKeyVaults } from '../_auth';

/**
 * Initializes the AgentRuntime with the client store.
 * @param provider - The provider name.
 * @param payload - Init options
 * @returns The initialized AgentRuntime instance
 *
 * **Note**: if you try to fetch directly, use `fetchOnClient` instead.
 */
export const initializeWithClientStore = (provider: string, payload?: any) => {
  /**
   * Since #5267, we map parameters for client-fetch in function `getProviderAuthPayload`
   * which called by `createPayloadWithKeyVaults` below.
   * @see https://github.com/lobehub/lobe-chat/pull/5267
   * @file src/services/_auth.ts
   */
  const providerAuthPayload = { ...payload, ...createPayloadWithKeyVaults(provider) };
  const commonOptions = {
    // Allow OpenAI SDK and Anthropic SDK run on browser
    dangerouslyAllowBrowser: true,
  };
  /**
   * Configuration override order:
   * payload -> providerAuthPayload -> commonOptions
   */
  return ModelRuntime.initializeWithProvider(provider, {
    ...commonOptions,
    ...providerAuthPayload,
    ...payload,
  });
};
