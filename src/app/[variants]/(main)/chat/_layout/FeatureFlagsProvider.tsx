'use client';

import { PropsWithChildren, createContext, useContext } from 'react';

interface FeatureFlags {
  hideDocs?: boolean;
  showChangelog?: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlags>({});

export const useFeatureFlags = () => useContext(FeatureFlagsContext);

export const FeatureFlagsProvider = ({
  children,
  hideDocs,
  showChangelog,
}: PropsWithChildren<FeatureFlags>) => {
  return (
    <FeatureFlagsContext.Provider value={{ hideDocs, showChangelog }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};
