import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';
import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService } from '@/services/userMemory/index';

import { UserMemoryStore } from '../../store';

const FETCH_EXPERIENCES_KEY = 'useFetchDisplayExperiences';

export interface ExperienceAction {
  deleteExperience: (id: string) => Promise<void>;
  useFetchExperiences: () => SWRResponse<DisplayExperienceMemory[]>;
}

export const createExperienceSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  ExperienceAction
> = () => ({
  deleteExperience: async (id) => {
    await memoryCRUDService.deleteExperience(id);
    await mutate(FETCH_EXPERIENCES_KEY);
  },
  useFetchExperiences: () =>
    useClientDataSWR(FETCH_EXPERIENCES_KEY, memoryCRUDService.getDisplayExperiences),
});
