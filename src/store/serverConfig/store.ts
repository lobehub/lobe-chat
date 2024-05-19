import { StoreApi } from 'zustand';
import { createContext } from 'zustand-utils';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { DEFAULT_FEATURE_FLAGS, IFeatureFlags } from '@/config/featureFlags';
import { GlobalServerConfig } from '@/types/serverConfig';
import { isDev } from '@/utils/env';
import { merge } from '@/utils/merge';
import { StoreApiWithSelector } from '@/utils/zustand';

const initialState: ServerConfigStore = {
  featureFlags: DEFAULT_FEATURE_FLAGS,
  serverConfig: { telemetry: {} },
};

//  ===============  聚合 createStoreFn ============ //

export interface ServerConfigStore {
  featureFlags: IFeatureFlags;
  isMobile?: boolean;
  serverConfig: GlobalServerConfig;
}

type CreateStore = (
  initState: Partial<ServerConfigStore>,
) => StateCreator<ServerConfigStore, [['zustand/devtools', never]]>;

const createStore: CreateStore = (runtimeState) => () => ({
  ...merge(initialState, runtimeState),
});

//  ===============  实装 useStore ============ //

let store: StoreApi<ServerConfigStore>;

declare global {
  interface Window {
    global_serverConfigStore: StoreApi<ServerConfigStore>;
  }
}

export const initServerConfigStore = (initState: Partial<ServerConfigStore>) =>
  createWithEqualityFn<ServerConfigStore>()(
    devtools(createStore(initState || {}), {
      name: 'LobeChat_ServerConfig' + (isDev ? '_DEV' : ''),
    }),
    shallow,
  );

export const createServerConfigStore = (initState?: Partial<ServerConfigStore>) => {
  // make sure there is only one store
  if (!store) {
    store = createWithEqualityFn<ServerConfigStore>()(
      devtools(createStore(initState || {}), {
        name: 'LobeChat_ServerConfig' + (isDev ? '_DEV' : ''),
      }),
      shallow,
    );

    if (typeof window !== 'undefined') {
      window.global_serverConfigStore = store;
    }
  }

  return store;
};

export const { useStore: useServerConfigStore, Provider } =
  createContext<StoreApiWithSelector<ServerConfigStore>>();
