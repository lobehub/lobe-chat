import { isEmpty } from 'lodash-es';
import { StorageValue } from 'zustand/middleware/persist';

interface UrlSearchHelper {
  getUrlSearch: () => string;
  setUrlSearch: (params: URLSearchParams) => void;
}

const createUrlSearch = (mode: 'search' | 'hash' = 'hash'): UrlSearchHelper => {
  if (mode === 'hash')
    return {
      getUrlSearch: () => location.hash.slice(1),
      setUrlSearch: (params: URLSearchParams) => (location.hash = params.toString()),
    };

  return {
    getUrlSearch: () => location.search.slice(1),
    setUrlSearch: (params: URLSearchParams) => {
      if (params.size === 0) return;

      history.replaceState({}, '', '?' + params.toString());
    },
  };
};

export const creatUrlStorage = <State extends object>(mode: 'hash' | 'search' = 'hash') => {
  const { setUrlSearch, getUrlSearch } = createUrlSearch(mode);

  return {
    getItem: <T extends State>(): StorageValue<T> | undefined => {
      const searchParameters = new URLSearchParams(getUrlSearch());

      if (searchParameters.size === 0) return undefined;

      const state = Object.fromEntries(searchParameters.entries()) as T;

      return { state };
    },
    removeItem: (key?: string) => {
      const searchParameters = new URLSearchParams(getUrlSearch());
      if (key) searchParameters.delete(key);

      setUrlSearch(searchParameters);
    },
    setItem: <T extends State>(name: string, state: T) => {
      const searchParameters = new URLSearchParams(getUrlSearch());

      for (const [urlKey, v] of Object.entries(state)) {
        switch (typeof v) {
          case 'boolean': {
            searchParameters.set(urlKey, (v ? 1 : 0).toString());
            break;
          }

          case 'bigint':
          case 'number': {
            searchParameters.set(urlKey, v.toString());
            break;
          }

          case 'string': {
            searchParameters.set(urlKey, v);
            break;
          }

          case 'object': {
            if (isEmpty(v)) {
              searchParameters.delete(urlKey);
              continue;
            }

            searchParameters.set(urlKey, JSON.stringify(v));
            break;
          }
        }
      }

      setUrlSearch(searchParameters);
    },
  };
};
