import { HyperStorageOptionsObj } from './type';

export const createKeyMapper = (options: HyperStorageOptionsObj) => {
  const mapStateKeyToStorageKey = (
    key: string,
    mode: keyof HyperStorageOptionsObj = 'localStorage',
  ) => {
    const media = options[mode];
    if (media === false) return key;

    const selectors = media?.selectors;
    if (!selectors) return key;

    let storageKey: string | undefined;

    for (const selector of selectors) {
      if (typeof selector === 'string') {
        if (selector === key) storageKey = key;
      } else {
        if (selector[key]) storageKey = selector[key];
      }
    }

    return storageKey;
  };

  const getStateKeyFromStorageKey = (
    key: string,
    mode: keyof HyperStorageOptionsObj = 'localStorage',
  ) => {
    const media = options[mode];
    if (media === false) return key;

    const selectors = media?.selectors;
    if (!selectors) return key;

    let stateKey: string | undefined;

    for (const item of selectors) {
      // 对象如果是 字符串，直接返回该 item key
      if (typeof item === 'string') {
        if (item === key) stateKey = key;
      } else {
        for (const [k, v] of Object.entries(item)) {
          if (v === key) stateKey = k;
        }
      }
    }

    return stateKey;
  };

  return {
    getStateKeyFromStorageKey,
    mapStateKeyToStorageKey,
  };
};
