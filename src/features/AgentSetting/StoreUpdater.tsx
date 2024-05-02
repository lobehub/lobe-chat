import { memo } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { State, useStoreApi } from './store';

export type StoreUpdaterProps = Partial<
  Pick<State, 'onMetaChange' | 'onConfigChange' | 'meta' | 'config' | 'id'>
>;

const StoreUpdater = memo<StoreUpdaterProps>(
  ({ onConfigChange, id, onMetaChange, meta, config }) => {
    const storeApi = useStoreApi();
    const useStoreUpdater = createStoreUpdater(storeApi);

    useStoreUpdater('meta', meta);
    useStoreUpdater('config', config);
    useStoreUpdater('onConfigChange', onConfigChange);
    useStoreUpdater('onMetaChange', onMetaChange);
    useStoreUpdater('id', id);

    return null;
  },
);

export default StoreUpdater;
