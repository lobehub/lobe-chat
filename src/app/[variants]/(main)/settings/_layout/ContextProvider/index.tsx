'use client';

import { type ReactNode, createContext, use } from 'react';

interface SettingsContextType {
  showOpenAIApiKey?: boolean;
  showOpenAIProxyUrl?: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettingsContext = () => {
  const context = use(SettingsContext);
  if (!context) {
    throw new Error(
      'useSettingsContext must be used within a descendant of SettingsContextProvider',
    );
  }
  return context;
};

export const SettingsContextProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: SettingsContextType;
}) => {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsContextProvider;
