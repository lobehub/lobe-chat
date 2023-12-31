import { PersistStorage } from 'zustand/middleware';
import { StorageValue } from 'zustand/middleware/persist';

import { createIndexedDB } from './indexedDB';
import { createKeyMapper } from './keyMapper';
import { createLocalStorage } from './localStorage';
import { HyperStorageOptions } from './type';
import { creatUrlStorage } from './urlStorage';

export const createHyperStorage = <T extends object>(
  options: HyperStorageOptions,
): PersistStorage<T> => {
  const optionsObj = typeof options === 'function' ? options() : options;

  const getLocalStorageConfig = () => {
    if (optionsObj.localStorage === false) {
      return { dbName: '', skipLocalStorage: true, useIndexedDB: false };
    }

    const useIndexedDB = optionsObj.localStorage?.mode === 'indexedDB';
    const dbName = optionsObj.localStorage?.dbName || 'indexedDB';

    return { dbName, skipLocalStorage: false, useIndexedDB };
  };

  const hasUrl = !!optionsObj.url;

  const { skipLocalStorage, useIndexedDB, dbName } = getLocalStorageConfig();

  const { mapStateKeyToStorageKey, getStateKeyFromStorageKey } = createKeyMapper(optionsObj);

  const indexedDB = createIndexedDB(dbName);
  const localStorage = createLocalStorage();
  const urlStorage = creatUrlStorage(optionsObj.url?.mode);
  return {
    getItem: async (name): Promise<StorageValue<T>> => {
      const state: any = {};
      let version: number | undefined;

      // ============== 处理 Local Storage  ============== //
      if (!skipLocalStorage) {
        let localState: StorageValue<T> | undefined;

        // 如果使用 indexedDB，优先从 indexedDB 中获取
        if (useIndexedDB) {
          localState = await indexedDB.getItem(name);
        }
        // 如果 indexedDB 中不存在，则再试试 localStorage
        if (!localState) localState = localStorage.getItem(name);

        if (localState) {
          version = localState.version;
          for (const [k, v] of Object.entries(localState.state)) {
            const key = getStateKeyFromStorageKey(k, 'localStorage');
            if (key) state[key] = v;
          }
        }
      }

      // ============== 处理 URL Storage  ============== //
      // 不从 URL 中获取 version，由于 url 状态是临时态 不作为版本控制的依据
      if (hasUrl) {
        const urlState = urlStorage.getItem();

        if (urlState) {
          for (const [k, v] of Object.entries(urlState.state)) {
            const key = getStateKeyFromStorageKey(k, 'url');
            // 当存在 UrlSelector 逻辑，且 key 有效时，才将状态加入终态 state
            if (hasUrl && key) {
              state[key] = v;
            }
          }
        }
      }

      return { state, version };
    },
    removeItem: async (key) => {
      // ============== 处理 Local Storage  ============== //
      if (!skipLocalStorage) {
        if (useIndexedDB) {
          await indexedDB.removeItem(key);
        } else {
          localStorage.removeItem(key);
        }
      }

      // ============== 处理 URL Storage  ============== //
      if (hasUrl) {
        const storageKey = getStateKeyFromStorageKey(key, 'url');

        urlStorage.removeItem(storageKey);
      }
    },

    setItem: async (name, newValue) => {
      // ============== 处理 Local Storage  ============== //
      const localState: Record<string, any> = {};
      for (const [k, v] of Object.entries(newValue.state)) {
        const localKey = mapStateKeyToStorageKey(k, 'localStorage');
        if (localKey) localState[localKey] = v;
      }

      if (!skipLocalStorage) {
        if (useIndexedDB) {
          await indexedDB.setItem(name, localState, newValue.version);
        } else {
          localStorage.setItem(name, localState, newValue.version);
        }
      }

      // ============== 处理 URL Storage  ============== //
      if (hasUrl) {
        // 转换 key 为目标 key
        const finalEntries = Object.entries(newValue.state)
          .map(([k, v]) => {
            const urlKey = mapStateKeyToStorageKey(k, 'url');
            if (!urlKey) return undefined;
            return [urlKey, v];
          })
          .filter(Boolean) as [string, any][];

        urlStorage.setItem(name, Object.fromEntries(finalEntries));
      }
    },
  };
};
