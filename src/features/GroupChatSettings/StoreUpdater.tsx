'use client';

import { ForwardedRef, memo, useImperativeHandle } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { GroupChatSettingsInstance, useGroupChatSettings } from './hooks/useGroupChatSettings';
import { State, useStoreApi } from './store';

export interface StoreUpdaterProps
  extends Partial<
    Pick<State, 'onMetaChange' | 'onConfigChange' | 'meta' | 'config' | 'id' | 'loading'>
  > {
  instanceRef?: ForwardedRef<GroupChatSettingsInstance> | null;
}

const StoreUpdater = memo<StoreUpdaterProps>(
  ({ onConfigChange, instanceRef, id, onMetaChange, meta, config, loading }) => {
    const storeApi = useStoreApi();
    const useStoreUpdater = createStoreUpdater(storeApi);

    useStoreUpdater('meta', meta);
    useStoreUpdater('config', config);
    useStoreUpdater('onConfigChange', onConfigChange);
    useStoreUpdater('onMetaChange', onMetaChange);
    useStoreUpdater('loading', loading);
    useStoreUpdater('id', id);

    const instance = useGroupChatSettings();
    useImperativeHandle(instanceRef, () => instance);

    return null;
  },
);

export default StoreUpdater;
