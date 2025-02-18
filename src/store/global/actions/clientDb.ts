import { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { useOnlyFetchOnceSWR } from '@/libs/swr';
import type { GlobalStore } from '@/store/global';
import { DatabaseLoadingState, OnStageChange } from '@/types/clientDB';

type InitClientDBParams = { onStateChange: OnStageChange };
/**
 * 设置操作
 */
export interface GlobalClientDBAction {
  initializeClientDB: (params?: InitClientDBParams) => Promise<void>;
  markPgliteEnabled: () => void;
  useInitClientDB: (params?: InitClientDBParams) => SWRResponse;
}

export const clientDBSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  GlobalClientDBAction
> = (set, get) => ({
  initializeClientDB: async (params) => {
    // if the db has started initialized or not error, just skip.
    if (
      get().initClientDBStage !== DatabaseLoadingState.Idle &&
      get().initClientDBStage !== DatabaseLoadingState.Error
    )
      return;

    const { initializeDB } = await import('@/database/client/db');
    await initializeDB({
      onError: (error) => {
        set({ initClientDBError: error });
      },
      onProgress: (data) => {
        set({ initClientDBProcess: data });
      },
      onStateChange: (state) => {
        set({ initClientDBStage: state });
        params?.onStateChange?.(state);
      },
    });
  },
  markPgliteEnabled: () => {
    get().updateSystemStatus({ isEnablePglite: true });
  },
  useInitClientDB: (params) =>
    useOnlyFetchOnceSWR('initClientDB', () => get().initializeClientDB(params)),
});
