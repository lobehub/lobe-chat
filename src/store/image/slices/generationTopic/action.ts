import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { generationTopicService } from '@/services/generationTopic';
import { ImageGenerationTopic } from '@/types/generation';

import type { ImageStore } from '../../store';

const FETCH_GENERATION_TOPICS_KEY = 'fetchGenerationTopics';

export interface GenerationTopicAction {
  createGenerationTopic: () => Promise<string>;
  useFetchGenerationTopics: (
    enabled: boolean,
    isLogin: boolean | undefined,
  ) => SWRResponse<ImageGenerationTopic[]>;
  refreshGenerationTopics: () => Promise<void>;
}

export const createGenerationTopicSlice: StateCreator<
  ImageStore,
  [['zustand/devtools', never]],
  [],
  GenerationTopicAction
> = (set, get) => ({
  createGenerationTopic: async () => {
    const { refreshGenerationTopics } = get();

    const generationTopicId = await generationTopicService.createTopic();
    await refreshGenerationTopics();

    return generationTopicId;
  },

  useFetchGenerationTopics: (enabled, isLogin) =>
    useClientDataSWR<ImageGenerationTopic[]>(
      enabled ? [FETCH_GENERATION_TOPICS_KEY, isLogin] : null,
      () => generationTopicService.getAllGenerationTopics(),
      {
        suspense: true,
      },
    ),

  refreshGenerationTopics: async () => {
    await mutate([FETCH_GENERATION_TOPICS_KEY, true]);
  },
});
