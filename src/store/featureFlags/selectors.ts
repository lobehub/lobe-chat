import { mapFeatureFlagsEnvToState } from '@/config/featureFlags';

import { FeatureFlagStore } from './store';

export const featureFlagsSelectors = (s: FeatureFlagStore) => mapFeatureFlagsEnvToState(s);
