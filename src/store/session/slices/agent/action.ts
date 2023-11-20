import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { useGlobalStore } from '@/store/global';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig } from '@/types/session';

import { SessionStore } from '../../store';
import { sessionSelectors } from '../session/selectors';

/**
 * 助手接口
 */
export interface AgentAction {
  removePlugin: (id: string) => void;
  /**
   * 更新代理配置
   * @param config - 部分 LobeAgentConfig 的配置
   */
  updateAgentConfig: (config: Partial<LobeAgentConfig>) => void;
  updateAgentMeta: (meta: Partial<MetaData>) => void;
}

export const createAgentSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  removePlugin: (id) => {
    const { activeId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!activeId || !session) return;

    const config = produce(session.config, (draft) => {
      draft.plugins = draft.plugins?.filter((i) => i !== id) || [];
    });

    get().dispatchSession({ config, id: activeId, type: 'updateSessionConfig' });
  },

  updateAgentConfig: (config) => {
    const { activeId, dispatchSession } = get();
    const session = sessionSelectors.currentSession(get());
    if (!activeId || !session) return;

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
    dispatchSession({ config, id: activeId, type: 'updateSessionConfig' });
  },

  updateAgentMeta: (meta) => {
    const { activeId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!activeId || !session) return;

    for (const [key, value] of Object.entries(meta)) {
      if (value !== undefined) {
        get().dispatchSession({
          id: activeId,
          key: key as keyof MetaData,
          type: 'updateSessionMeta',
          value,
        });
      }
    }
  },
});
