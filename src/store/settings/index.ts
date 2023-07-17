import { create } from 'zustand';
import { type PersistOptions, devtools, persist } from 'zustand/middleware';

import { type SettingsStore, createStore } from './store';

export const LOBE_SETTINGS = 'LOBE_SETTINGS';

const persistOptions: PersistOptions<SettingsStore> = {
  name: LOBE_SETTINGS,
  skipHydration: true,
};

export const useSettings = create<SettingsStore>()(
  persist(
    devtools(createStore, {
      name: LOBE_SETTINGS,
    }),
    persistOptions,
  ),
);

export * from './selectors';
export type { SettingsStore } from './store';
