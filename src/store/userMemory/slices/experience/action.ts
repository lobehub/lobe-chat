import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { UserMemoryExperiencesWithoutVectors } from '@/database/schemas';
import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService } from '@/services/userMemory/index';

import { UserMemoryStore } from '../../store';

const FETCH_EXPERIENCES_KEY = 'useFetchExperiences';

export interface ExperienceAction {
  useFetchExperiences: () => SWRResponse<UserMemoryExperiencesWithoutVectors[]>;
}

export const createExperienceSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  ExperienceAction
> = () => ({
  useFetchExperiences: () => useClientDataSWR(FETCH_EXPERIENCES_KEY, memoryCRUDService.getExperiences),
});
