import { mapFeatureFlagsEnvToState } from '@/config/featureFlags';

import { ServerConfigStore } from './store';

export const featureFlagsSelectors = (s: ServerConfigStore) =>
  mapFeatureFlagsEnvToState(s.featureFlags);

export const serverConfigSelectors = {
  enabledOAuthSSO: (s: ServerConfigStore) => s.serverConfig.enabledOAuthSSO,
  enabledTelemetryChat: (s: ServerConfigStore) => s.serverConfig.telemetry.langfuse || false,
};
