import { createContext } from 'react';

export interface ProviderSettingsContextValue {
  modelEditable?: boolean;
  showAddNewModel?: boolean;
  showModelFetcher?: boolean;
}

export const ProviderSettingsContext = createContext<ProviderSettingsContextValue>({});
