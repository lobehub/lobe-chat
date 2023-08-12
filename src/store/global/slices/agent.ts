import { produce } from 'immer';
import { merge } from 'lodash-es';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_AGENT } from '@/const/settings';
import { MetaData } from '@/types/meta';
import type { LobeAgentSession } from '@/types/session';
import { LobeAgentConfig } from '@/types/session';
import type { GlobalSettings } from '@/types/settings';
import { setNamespace } from '@/utils/storeDebug';

import type { GlobalStore } from '../store';

const t = setNamespace('settings');

/**
 * 设置操作
 */
export interface AgentAction {
  resetAgentConfig: () => void;
  resetAgentMeta: () => void;
  resetDefaultAgent: () => void;
  setAgentConfig: (config: Partial<LobeAgentSession['config']>) => void;
  setAgentMeta: (meta: Partial<LobeAgentSession['meta']>) => void;
  toggleAgentPanel: (visible?: boolean) => void;
  toggleAgentPlugin: (pluginId: string) => void;
}

export const createAgentSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  resetAgentConfig: () => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent.config = DEFAULT_AGENT.config;
    });
    set({ settings }, false, t('resetAgentConfig'));
  },
  resetAgentMeta: () => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent.meta = DEFAULT_AGENT.meta;
    });
    set({ settings }, false, t('resetAgentMeta'));
  },
  resetDefaultAgent: () => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent = DEFAULT_AGENT;
    });
    set({ settings }, false, t('resetDefaultAgent'));
  },
  setAgentConfig: (config) => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      const oldConfig = draft.defaultAgent.config as LobeAgentConfig;
      draft.defaultAgent.config = merge(oldConfig, config);
    });

    set({ settings }, false, t('setAgentConfig', config));
  },
  setAgentMeta: (meta) => {
    const settings = produce(get().settings, (draft) => {
      const oldMeta = draft.defaultAgent.meta as MetaData;
      draft.defaultAgent.meta = merge(oldMeta, meta);
    });

    set({ settings }, false, t('setAgentMeta', meta));
  },
  toggleAgentPanel: (newValue) => {
    const showAgentConfig = typeof newValue === 'boolean' ? newValue : !get().showAgentConfig;

    set({ showAgentConfig }, false, t('toggleAgentPanel', newValue));
  },
  toggleAgentPlugin: (id: string) => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      const oldConfig = draft.defaultAgent.config as LobeAgentConfig;
      if (oldConfig.plugins === undefined) {
        oldConfig.plugins = [id];
      } else {
        if (oldConfig.plugins.includes(id)) {
          oldConfig.plugins.splice(oldConfig.plugins.indexOf(id), 1);
        } else {
          oldConfig.plugins.push(id);
        }
      }
    });

    set({ settings }, false, t('toggleAgentPlugin', id));
  },
});
