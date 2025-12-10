import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { QueryTagsResult } from '@/database/models/userMemory';
import { useClientDataSWR } from '@/libs/swr';
import { userMemoryService } from '@/services/userMemory';

import { UserMemoryStore } from '../../store';

const FETCH_TAGS_KEY = 'useFetchTags';
const n = (namespace: string) => namespace;

export interface HomeAction {
  useFetchTags: () => SWRResponse<QueryTagsResult[]>;
}

export const createHomeSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  HomeAction
> = (set) => ({
  useFetchTags: () =>
    useClientDataSWR(
      FETCH_TAGS_KEY,
      () =>
        userMemoryService
          .queryTags
          //   {
          //   layers: [LayersEnum.Identity],
          //   page: 1,
          //   size: 64,
          // }
          (),
      {
        onSuccess: (data: QueryTagsResult[] | undefined) => {
          set(
            {
              tags: data || [],
              tagsInit: true,
            },
            false,
            n('useFetchTags/onSuccess'),
          );
        },
      },
    ),
});
