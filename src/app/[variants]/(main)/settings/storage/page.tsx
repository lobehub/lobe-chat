'use client';

import Advanced from './Advanced';
import IndexedDBStorage from './IndexedDBStorage';

const StorageEstimate = () => {
  return (
    <>
      <IndexedDBStorage />
      <Advanced />
    </>
  );
};

export default StorageEstimate;
