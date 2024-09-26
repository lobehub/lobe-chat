import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { merge } from '@/utils/merge';

import { DEFAULT_FEATURE_FLAGS, mapFeatureFlagsEnvToState } from './schema';
import { parseFeatureFlag } from './utils/parser';

const env = createEnv({
  client: {
    NEXT_PUBLIC_FEATURE_FLAGS: z.string().optional(),
  },
  runtimeEnv: {
    FEATURE_FLAGS: process.env.FEATURE_FLAGS,
    NEXT_PUBLIC_FEATURE_FLAGS: process.env.NEXT_PUBLIC_FEATURE_FLAGS,
  },
  server: {
    FEATURE_FLAGS: z.string().optional(),
  },
});

export const getServerFeatureFlagsValue = () => {
  const flags = parseFeatureFlag(env.FEATURE_FLAGS);

  return merge(DEFAULT_FEATURE_FLAGS, flags);
};

export const getClientFeatureFlagsValue = () => {
  const flags = parseFeatureFlag(env.NEXT_PUBLIC_FEATURE_FLAGS);

  return merge(DEFAULT_FEATURE_FLAGS, flags);
};

export const serverFeatureFlags = () => {
  const serverConfig = getServerFeatureFlagsValue();

  return mapFeatureFlagsEnvToState(serverConfig);
};

export const clientFeatureFlags = () => {
  const clientConfig = getClientFeatureFlagsValue();

  return mapFeatureFlagsEnvToState(clientConfig);
};

export * from './schema';
