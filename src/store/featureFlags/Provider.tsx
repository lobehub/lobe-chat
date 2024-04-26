'use client';

import { ReactNode, memo } from 'react';

import { IFeatureFlags } from '@/config/featureFlags';

import { Provider, createFeatureFlagsStore } from './store';

interface GlobalStoreProviderProps {
  children: ReactNode;
  featureFlags?: Partial<IFeatureFlags>;
}

export const FeatureFlagStoreProvider = memo<GlobalStoreProviderProps>(
  ({ children, featureFlags }) => (
    <Provider createStore={() => createFeatureFlagsStore(featureFlags)}>{children}</Provider>
  ),
);
