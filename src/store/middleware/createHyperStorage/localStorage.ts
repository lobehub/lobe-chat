import { StorageValue } from 'zustand/middleware/persist';

export const createLocalStorage = <State extends any>() => ({
  getItem: <T extends State>(name: string): StorageValue<T> | undefined => {
    if (!global.localStorage) return undefined;
    const string = localStorage.getItem(name);

    if (string) return JSON.parse(string) as StorageValue<T>;

    return undefined;
  },
  removeItem: (name: string) => {
    if (global.localStorage) localStorage.removeItem(name);
  },
  setItem: <T extends State>(name: string, state: T, version: number | undefined) => {
    if (global.localStorage) localStorage.setItem(name, JSON.stringify({ state, version }));
  },
});
