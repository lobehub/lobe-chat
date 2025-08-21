'use client';

import { useMemo } from 'react';

import { PublicAction } from '../store/action';
import { useStoreApi } from '../store';

export type GroupChatSettingsInstance = PublicAction;

export const useGroupChatSettings = (): GroupChatSettingsInstance => {
  const storeApi = useStoreApi();

  const {
    updateGroupConfig,
    updateGroupMeta,
    resetGroupConfig,
    resetGroupMeta,
  } = storeApi.getState();

  return useMemo(
    () => ({
      resetGroupConfig,
      resetGroupMeta,
      updateGroupConfig,
      updateGroupMeta,
    }),
    [],
  );
};