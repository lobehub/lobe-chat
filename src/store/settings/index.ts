import equal from 'fast-deep-equal';
import { type PersistOptions, devtools, persist } from 'zustand/middleware';
import { createWithEqualityFn } from 'zustand/traditional';

import { isDev } from '@/utils/env';

import { type SettingsStore, createStore } from './store';

export const LOBE_SETTINGS = 'LOBE_SETTINGS';

const persistOptions: PersistOptions<SettingsStore> = {
  name: LOBE_SETTINGS,
  skipHydration: true,
};

export const useSettings = createWithEqualityFn<SettingsStore>()(
  persist(
    devtools(createStore, {
      name: LOBE_SETTINGS + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  equal,
);

export * from './selectors';
export type { SettingsStore } from './store';
