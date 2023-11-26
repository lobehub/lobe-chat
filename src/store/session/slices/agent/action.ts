import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { sessionService } from '@/services/session';
import { useGlobalStore } from '@/store/global';
import { LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';

import { SessionStore } from '../../store';
import { sessionSelectors } from '../session/selectors';

/**
 * 助手接口
 */
export interface AgentAction {
  removePlugin: (id: string) => void;
  updateAgentConfig: (config: Partial<LobeAgentConfig>) => void;
  updateAgentMeta: (meta: Partial<MetaData>) => void;
}

export const createAgentSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  removePlugin: async (id) => {
    const session = sessionSelectors.currentSession(get());
    if (!session) return;

    const { activeId, refresh } = get();

    const config = produce(session.config, (draft) => {
      draft.plugins = draft.plugins?.filter((i) => i !== id) || [];
    });

    await sessionService.updateSessionConfig(activeId, config);
    await refresh();
  },

  updateAgentConfig: async (config) => {
    const session = sessionSelectors.currentSession(get());
    if (!session) return;

    const { activeId, refresh } = get();

    // if is the inbox session, update the global config
    if (sessionSelectors.isInboxSession(get())) {
      useGlobalStore.getState().updateDefaultAgent({ config });
      // NOTE: DON'T ADD RETURN HERE.
      // we need to use `dispatchSession` below to update inbox config to trigger the inbox config rerender
    }

    // Although we use global store to store the default agent config,
    // due to the `currentAgentConfig` selector use `useGlobalStore.getState()`
    // to get the default agent config which not rerender on global store update
    // we need to update the session config here.

    await sessionService.updateSessionConfig(activeId, config);
    await refresh();
  },

  updateAgentMeta: async (meta) => {
    const session = sessionSelectors.currentSession(get());
    if (!session) return;

    const { activeId, refresh } = get();

    await sessionService.updateSessionMeta(activeId, meta);
    await refresh();
  },
});
