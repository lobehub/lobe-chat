'use client';

import { ReactNode, memo, useRef } from 'react';

import { Provider, createStore } from '../store';

interface ResourceManagerProviderProps {
  children: ReactNode;
}

export const ResourceManagerProvider = memo<ResourceManagerProviderProps>(({ children }) => {
  const storeRef = useRef(createStore());

  return <Provider createStore={() => storeRef.current}>{children}</Provider>;
});

ResourceManagerProvider.displayName = 'ResourceManagerProvider';
