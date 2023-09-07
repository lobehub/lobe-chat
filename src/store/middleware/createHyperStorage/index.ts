import { isEmpty } from 'lodash-es';
import { PersistStorage } from 'zustand/middleware';
import { StorageValue } from 'zustand/middleware/persist';

import { createKeyMapper } from './keyMapper';
import { HyperStorageOptions } from './type';
import { createUrlSearch } from './urlSearch';

export const createHyperStorage = <T extends object>(
  options: HyperStorageOptions,
): PersistStorage<T> => {
  const hasUrl = !!options.url;

  const { setUrlSearch, getUrlSearch } = createUrlSearch(options.url?.mode);

  const { mapStateKeyToStorageKey, getStateKeyFromStorageKey } = createKeyMapper(options);

  return {
    getItem: (name): StorageValue<T> => {
      const state: any = {};
      let version: number | undefined;
      // ============== 处理 Local Storage  ============== //
      const string = localStorage.getItem(name);
      if (string) {
        const localState: StorageValue<T> = JSON.parse(string);
        version = localState.version;
        for (const [k, v] of Object.entries(localState.state)) {
          const key = getStateKeyFromStorageKey(k, 'localStorage');
          if (key) state[key] = v;
        }
      }

      // ============== 处理 URL Storage  ============== //
      // 不从 URL 中获取 version，由于 url 状态是临时态 不作为版本控制的依据
      if (hasUrl) {
        const searchParameters = new URLSearchParams(getUrlSearch());

        for (const [k, v] of searchParameters.entries()) {
          const key = getStateKeyFromStorageKey(k, 'url');
          // 当存在 UrlSelector 逻辑，且 key 有效时，才将状态加入终态 state
          if (hasUrl && key) {
            state[key] = v;
          }
        }
      }

      return { state, version };
    },
    removeItem: (key): void => {
      // ============== 处理 URL Storage  ============== //
      if (hasUrl) {
        const searchParameters = new URLSearchParams(getUrlSearch());

        const storageKey = getStateKeyFromStorageKey(key, 'url');
        if (storageKey) searchParameters.delete(storageKey);

        setUrlSearch(searchParameters);
      }
    },
    setItem: (name, newValue) => {
      // ============== 处理 Local Storage  ============== //
      const localState: Record<string, any> = {};
      for (const [k, v] of Object.entries(newValue.state)) {
        const localKey = mapStateKeyToStorageKey(k, 'localStorage');
        if (localKey) localState[localKey] = v;
      }

      localStorage.setItem(name, JSON.stringify({ ...newValue, state: localState }));

      // ============== 处理 URL Storage  ============== //
      if (hasUrl) {
        const searchParameters = new URLSearchParams(getUrlSearch());

        for (const [k, v] of Object.entries(newValue.state)) {
          const urlKey = mapStateKeyToStorageKey(k, 'url');

          if (!urlKey) continue;

          if (isEmpty(v)) {
            searchParameters.delete(urlKey);
            continue;
          }

          if (typeof v === 'string') {
            searchParameters.set(urlKey, v);
          } else {
            searchParameters.set(urlKey, JSON.stringify(v));
          }
        }

        setUrlSearch(searchParameters);
      }
    },
  };
};
