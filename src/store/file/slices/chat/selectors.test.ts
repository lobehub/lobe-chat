import { beforeEach, describe, expect, it } from 'vitest';

import { FilesStoreState, initialState } from '../../initialState';
import { filesSelectors } from './selectors';

describe('filesSelectors', () => {
  let state: FilesStoreState;

  beforeEach(() => {
    // 创建并初始化 state 的模拟实例
    state = {
      ...initialState,
      imagesMap: {
        '1': {
          id: '1',
          name: 'a',
          fileType: 'image/png',
          saveMode: 'local',
          base64Url: 'base64string1',
          url: 'blob:abc',
        },
        '2': {
          id: '2',
          name: 'b',
          fileType: 'image/png',
          saveMode: 'url',
          base64Url: 'base64string2',
          url: 'url2',
        },
      },
    };
  });
});
