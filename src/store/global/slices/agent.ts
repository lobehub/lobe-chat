import { produce } from 'immer';
import type { StateCreator } from 'zustand/vanilla';

import { LobeAgentSettings } from '@/types/session';
import type { GlobalSettings } from '@/types/settings';
import { setNamespace } from '@/utils/storeDebug';

import type { GlobalStore } from '../store';

const t = setNamespace('settings');

/**
 * 设置操作
 */
export interface AgentAction {
  updateDefaultAgent: (agent: Partial<LobeAgentSettings>) => void;
}

export const createAgentSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  updateDefaultAgent: (agent) => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent = { ...draft.defaultAgent, ...agent };
    });

    set({ settings }, false, t('updateDefaultAgent', agent));
  },
});
