import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';
import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService } from '@/services/userMemory/index';

import { UserMemoryStore } from '../../store';

const FETCH_PREFERENCES_KEY = 'useFetchPreferences';

export interface PreferenceAction {
  useFetchPreferences: () => SWRResponse<DisplayPreferenceMemory[]>;
}

export const createPreferenceSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  PreferenceAction
> = () => ({
  useFetchPreferences: () =>
    useClientDataSWR(FETCH_PREFERENCES_KEY, memoryCRUDService.getDisplayPreferences),
});
