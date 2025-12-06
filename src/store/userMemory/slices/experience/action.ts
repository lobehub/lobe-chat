import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';
import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService } from '@/services/userMemory/index';

import { UserMemoryStore } from '../../store';

const FETCH_EXPERIENCES_KEY = 'useFetchDisplayExperiences';

export interface ExperienceAction {
  useFetchExperiences: () => SWRResponse<DisplayExperienceMemory[]>;
}

export const createExperienceSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  ExperienceAction
> = () => ({
  useFetchExperiences: () =>
    useClientDataSWR(FETCH_EXPERIENCES_KEY, memoryCRUDService.getDisplayExperiences),
});
