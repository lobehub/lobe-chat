import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

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
    const { activeId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!activeId || !session) return;

    get().dispatchSession({ config, id: activeId, type: 'updateSessionConfig' });
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
