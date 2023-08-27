import { produce } from 'immer';
import { merge } from 'lodash-es';
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
      const oldAgent = draft.defaultAgent as LobeAgentSettings;
      draft.defaultAgent = merge({}, oldAgent, agent);
    });

    set({ settings }, false, t('updateDefaultAgent', agent));
  },
});
