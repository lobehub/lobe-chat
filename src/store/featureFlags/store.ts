import { StoreApi } from 'zustand';
import { createContext } from 'zustand-utils';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { DEFAULT_FEATURE_FLAGS, IFeatureFlags } from '@/config/featureFlags';
import { isDev } from '@/utils/env';
import { StoreApiWithSelector } from '@/utils/zustand';

//  ===============  聚合 createStoreFn ============ //

export type FeatureFlagStore = IFeatureFlags;

const createStore: (
  initState: Partial<FeatureFlagStore>,
) => StateCreator<FeatureFlagStore, [['zustand/devtools', never]]> = (runtimeState) => () => ({
  ...DEFAULT_FEATURE_FLAGS,
  ...runtimeState,
});

//  ===============  实装 useStore ============ //

let store: StoreApi<FeatureFlagStore>;

export const createFeatureFlagsStore = (initState?: Partial<FeatureFlagStore>) => {
  // make sure there is only one store
  if (!store) {
    store = createWithEqualityFn<FeatureFlagStore>()(
      devtools(createStore(initState || {}), {
        name: 'LobeChat_FeatureFlags' + (isDev ? '_DEV' : ''),
      }),
      shallow,
    );
  }

  return store;
};

export const { useStore: useFeatureFlagStore, Provider } =
  createContext<StoreApiWithSelector<FeatureFlagStore>>();
