import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { DEFAULT_FEATURE_FLAGS } from '@/const/featureFlags';
import { merge } from '@/utils/merge';

import { parseFeatureFlag } from './parser';

const env = createEnv({
  runtimeEnv: {
    FEATURE_FLAGS: process.env.FEATURE_FLAGS,
  },

  server: {
    FEATURE_FLAGS: z.string().url(),
  },
});

export const serverFeatureFlags = () => {
  const flags = parseFeatureFlag(env.FEATURE_FLAGS);

  const serverConfig = merge(DEFAULT_FEATURE_FLAGS, flags);

  return {
    enableWebrtc: serverConfig.webrtc_sync,
    isAgentEditable: serverConfig.edit_agent,

    showCreateSession: serverConfig.create_session,
    showLLM: serverConfig.language_model_settings,

    showOpenAIApiKey: serverConfig.openai_api_key,
    showOpenAIProxyUrl: serverConfig.openai_proxy_url,
  };
};
