'use client';

import { ReactNode, memo } from 'react';

import { IFeatureFlags } from '@/config/featureFlags';
import { GlobalServerConfig } from '@/types/serverConfig';

import { Provider, createServerConfigStore } from './store';

interface GlobalStoreProviderProps {
  children: ReactNode;
  featureFlags?: Partial<IFeatureFlags>;
  serverConfig?: GlobalServerConfig;
}

export const ServerConfigStoreProvider = memo<GlobalStoreProviderProps>(
  ({ children, featureFlags, serverConfig }) => (
    <Provider createStore={() => createServerConfigStore({ featureFlags, serverConfig })}>
      {children}
    </Provider>
  ),
);
