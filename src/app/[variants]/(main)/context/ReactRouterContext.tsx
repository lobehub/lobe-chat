'use client';

import React, { createContext, memo, useContext } from 'react';

/**
 * Context to indicate if we're in a React Router environment
 * Used by shared hooks/components to choose between Next.js and React Router APIs
 */
const ReactRouterContext = createContext<boolean>(false);

export const useIsReactRouter = () => {
  return useContext(ReactRouterContext);
};

interface ReactRouterProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that marks the component tree as using React Router
 * Should be placed in (main) layout components
 */
export const ReactRouterProvider = memo<ReactRouterProviderProps>(({ children }) => {
  return <ReactRouterContext.Provider value={true}>{children}</ReactRouterContext.Provider>;
});

ReactRouterProvider.displayName = 'ReactRouterProvider';
