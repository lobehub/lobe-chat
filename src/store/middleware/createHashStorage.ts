import { isEmpty } from 'lodash-es';
import { PersistStorage } from 'zustand/middleware';

import { Compressor } from '@/utils/compass';

export const createHashStorage = <T extends object>(): PersistStorage<T> => {
  return {
    getItem: async () => {
      const searchParameters = new URLSearchParams(location.hash.slice(1));
      const state: any = {};
      const pool = [...searchParameters.entries()].map(async ([k, v]) => {
        const string_ = await Compressor.decompressAsync(v);

        try {
          state[k] = JSON.parse(string_);
        } catch {
          state[k] = string_;
        }
      });

      await Promise.all(pool);

      return { state } as any;
    },
    removeItem: (key): void => {
      const searchParameters = new URLSearchParams(location.hash.slice(1));
      searchParameters.delete(key);
      location.hash = searchParameters.toString();
    },
    setItem: async (_, newValue) => {
      const searchParameters = new URLSearchParams(location.hash.slice(1));

      const pool = Object.entries(newValue.state).map(async ([k, v]) => {
        if (isEmpty(v)) {
          searchParameters.delete(k);
          return;
        }
        if (typeof v === 'string') {
          searchParameters.set(k, await Compressor.compressAsync(v));
        } else {
          searchParameters.set(k, await Compressor.compressAsync(JSON.stringify(v)));
        }
      });
      await Promise.all(pool);

      location.hash = searchParameters.toString();
    },
  };
};
