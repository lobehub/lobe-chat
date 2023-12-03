import { produce } from 'immer';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { LobeAgentSettings } from '@/types/session';
import type { GlobalSettings } from '@/types/settings';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import type { GlobalStore } from '../store';

const n = setNamespace('settings');

/**
 * 设置操作
 */
export interface AgentAction {
  updateDefaultAgent: (agent: DeepPartial<LobeAgentSettings>) => void;
}

export const createAgentSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  updateDefaultAgent: (agent) => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent = merge(draft.defaultAgent, agent);
    });

    set({ settings }, false, n('updateDefaultAgent', agent));
  },
});
