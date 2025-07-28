'use client';

import { isServerMode } from '@/const/version';

import Advanced from './Advanced';
import IndexedDBStorage from './IndexedDBStorage';

const StorageEstimate = () => {
  return (
    <>
      {!isServerMode && <IndexedDBStorage />}
      <Advanced />
    </>
  );
};

export default StorageEstimate;
