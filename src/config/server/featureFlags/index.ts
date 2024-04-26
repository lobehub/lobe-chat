import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { DEFAULT_FEATURE_FLAGS, mapFeatureFlagsEnvToState } from '@/config/featureFlags';
import { merge } from '@/utils/merge';

import { parseFeatureFlag } from './parser';

const env = createEnv({
  runtimeEnv: {
    FEATURE_FLAGS: process.env.FEATURE_FLAGS,
  },

  server: {
    FEATURE_FLAGS: z.string().optional(),
  },
});

export const getServerFeatureFlagsValue = () => {
  const flags = parseFeatureFlag(env.FEATURE_FLAGS);

  return merge(DEFAULT_FEATURE_FLAGS, flags);
};

export const serverFeatureFlags = () => {
  const serverConfig = getServerFeatureFlagsValue();

  return mapFeatureFlagsEnvToState(serverConfig);
};
