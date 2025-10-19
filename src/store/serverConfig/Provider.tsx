'use client';

import { ReactNode, memo } from 'react';

import { IFeatureFlags, mapFeatureFlagsEnvToState } from '@/config/featureFlags';
import { GlobalServerConfig } from '@/types/serverConfig';

import { Provider, createServerConfigStore } from './store';

interface GlobalStoreProviderProps {
  children: ReactNode;
  featureFlags?: Partial<IFeatureFlags>;
  isMobile?: boolean;
  segmentVariants?: string;
  serverConfig?: GlobalServerConfig;
}

export const ServerConfigStoreProvider = memo<GlobalStoreProviderProps>(
  ({ children, featureFlags, serverConfig, isMobile, segmentVariants }) => (
    <Provider
      createStore={() =>
        createServerConfigStore({
          featureFlags: featureFlags ? mapFeatureFlagsEnvToState(featureFlags) : undefined,
          isMobile,
          segmentVariants,
          serverConfig,
        })
      }
    >
      {children}
    </Provider>
  ),
);
