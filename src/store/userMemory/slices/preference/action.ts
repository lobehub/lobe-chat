import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { UserMemoryPreferencesWithoutVectors } from '@/database/schemas';
import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService } from '@/services/userMemory/index';

import { UserMemoryStore } from '../../store';

const FETCH_PREFERENCES_KEY = 'useFetchPreferences';

export interface PreferenceAction {
  useFetchPreferences: () => SWRResponse<UserMemoryPreferencesWithoutVectors[]>;
}

export const createPreferenceSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  PreferenceAction
> = () => ({
  useFetchPreferences: () =>
    useClientDataSWR(FETCH_PREFERENCES_KEY, memoryCRUDService.getPreferences),
});
