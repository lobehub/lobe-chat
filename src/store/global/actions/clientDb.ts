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
      onError: ({ error, migrationsSQL, migrationTableItems }) => {
        set({
          initClientDBError: error,
          initClientDBMigrations: {
            sqls: migrationsSQL,
            tableRecords: migrationTableItems,
          },
        });
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
  markPgliteEnabled: async () => {
    get().updateSystemStatus({ isEnablePglite: true });

    if (navigator.storage && !!navigator.storage.persist) {
      // 1. Check if persistent permission has been obtained
      const isPersisted = await navigator.storage.persisted();

      // 2. If the persistent permission has not been obtained, request permission
      if (!isPersisted) {
        await navigator.storage.persist();
      }
    }
  },
  useInitClientDB: (params) =>
    useOnlyFetchOnceSWR('initClientDB', () => get().initializeClientDB(params)),
});
