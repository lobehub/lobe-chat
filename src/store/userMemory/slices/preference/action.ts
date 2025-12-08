import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';
import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService } from '@/services/userMemory/index';

import { UserMemoryStore } from '../../store';

const FETCH_PREFERENCES_KEY = 'useFetchPreferences';
const n = (namespace: string) => namespace;

export interface PreferenceAction {
  deletePreference: (id: string) => Promise<void>;
  useFetchPreferences: () => SWRResponse<DisplayPreferenceMemory[]>;
}

export const createPreferenceSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  PreferenceAction
> = (set) => ({
  deletePreference: async (id) => {
    await memoryCRUDService.deletePreference(id);
    await mutate(FETCH_PREFERENCES_KEY);
  },
  useFetchPreferences: () =>
    useClientDataSWR(FETCH_PREFERENCES_KEY, memoryCRUDService.getDisplayPreferences, {
      onSuccess: (data: DisplayPreferenceMemory[] | undefined) => {
        set(
          {
            preferences: data || [],
            preferencesInit: true,
          },
          false,
          n('useFetchPreferences/onSuccess'),
        );
      },
    }),
});
