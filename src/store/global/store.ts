import { produce } from 'immer';
import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { DEFAULT_AGENT, DEFAULT_LLM_CONFIG } from '@/const/settings';
import { SessionDefaultGroup } from '@/types/session';
import { isDev } from '@/utils/env';

import { createHyperStorage } from '../middleware/createHyperStorage';
import { type GlobalState, initialState } from './initialState';
import { type CommonAction, createCommonSlice } from './slices/common/action';
import { type SettingsAction, createSettingsSlice } from './slices/settings/action';

//  ===============  聚合 createStoreFn ============ //

export type GlobalStore = CommonAction & GlobalState & SettingsAction;

const createStore: StateCreator<GlobalStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createCommonSlice(...parameters),
  ...createSettingsSlice(...parameters),
});

//  ===============  persist 本地缓存中间件配置 ============ //
type GlobalPersist = Pick<GlobalStore, 'preference' | 'settings'>;

const persistOptions: PersistOptions<GlobalStore, GlobalPersist> = {
  merge: (persistedState, currentState) => {
    const state = persistedState as GlobalPersist;

    return {
      ...currentState,
      ...state,
      preference: produce(state.preference, (draft) => {
        if (!draft.expandSessionGroupKeys) {
          draft.expandSessionGroupKeys = [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default];
          delete (draft as any).sessionGroupKeys;
        }
      }),
      settings: produce(state.settings, (draft) => {
        if (!draft.defaultAgent) {
          draft.defaultAgent = DEFAULT_AGENT;
        }

        // migration to new data model
        if (!draft.languageModel) {
          draft.languageModel = {
            openAI: DEFAULT_LLM_CONFIG.openAI,
          };
        }
      }),
    };
  },
  name: 'LOBE_SETTINGS',

  skipHydration: true,

  storage: createHyperStorage({
    localStorage: {
      dbName: 'LobeHub',
      selectors: ['preference', 'settings'],
    },
  }),
};

//  ===============  实装 useStore ============ //

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  persist(
    devtools(createStore, {
      name: 'LobeChat_Global' + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  shallow,
);
