import { Compressor } from '@/utils/compass';
import isEmpty from 'lodash.isempty';
import { PersistStorage } from 'zustand/middleware';

export const createHashStorage = <T extends object>(): PersistStorage<T> => {
  return {
    getItem: async () => {
      const searchParams = new URLSearchParams(location.hash.slice(1));
      const state: any = {};
      const pool = Array.from(searchParams.entries()).map(async ([k, v]) => {
        const str = await Compressor.decompressAsync(v);

        try {
          state[k] = JSON.parse(str);
        } catch (e) {
          state[k] = str;
        }
      });

      await Promise.all(pool);

      return { state } as any;
    },
    setItem: async (_, newValue) => {
      const searchParams = new URLSearchParams(location.hash.slice(1));

      const pool = Object.entries(newValue.state).map(async ([k, v]) => {
        if (isEmpty(v)) {
          searchParams.delete(k);
          return;
        }
        if (typeof v === 'string') {
          searchParams.set(k, await Compressor.compressAsync(v));
        } else {
          searchParams.set(k, await Compressor.compressAsync(JSON.stringify(v)));
        }
      });
      await Promise.all(pool);

      location.hash = searchParams.toString();
    },
    removeItem: (key): void => {
      const searchParams = new URLSearchParams(location.hash.slice(1));
      searchParams.delete(key);
      location.hash = searchParams.toString();
    },
  };
};
