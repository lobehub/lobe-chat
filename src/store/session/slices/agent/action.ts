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

    const { activeId, refreshSessions } = get();

    const config = produce(session.config, (draft) => {
      draft.plugins = draft.plugins?.filter((i) => i !== id) || [];
    });

    await sessionService.updateSessionConfig(activeId, config);
    await refreshSessions();
  },

  updateAgentConfig: async (config) => {
    // if is the inbox session, update the global config
    const isInbox = sessionSelectors.isInboxSession(get());
    if (isInbox) {
      useGlobalStore.getState().updateDefaultAgent({ config });
    } else {
      const session = sessionSelectors.currentSession(get());
      if (!session) return;

      const { activeId } = get();

      await sessionService.updateSessionConfig(activeId, config);
    }

    // trigger store rerender
    await get().refreshSessions();
  },

  updateAgentMeta: async (meta) => {
    const session = sessionSelectors.currentSession(get());
    if (!session) return;

    const { activeId, refreshSessions } = get();

    await sessionService.updateSessionMeta(activeId, meta);
    await refreshSessions();
  },
});
