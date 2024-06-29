import { beforeEach, describe, expect, it } from 'vitest';

import { FilesStoreState } from '../../initialState';
import { filesSelectors } from './selectors';

describe('filesSelectors', () => {
  let state: FilesStoreState;

  beforeEach(() => {
    // 创建并初始化 state 的模拟实例
    state = {
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
      uploadingIds: [],
      // 假设 '3' 是不存在的 ID
      inputFilesList: ['1', '2', '3'],
    };
  });

  it('getImageDetailByList should return details for the provided list of image IDs', () => {
    const list = ['1', '2'];
    const details = filesSelectors.getImageDetailByList(list)(state);
    expect(details.length).toBe(2);
    expect(details[0].name).toBe('a');
    expect(details[1].name).toBe('b');
  });

  it('imageDetailList should return details for the images in the inputFilesList', () => {
    const details = filesSelectors.imageDetailList(state);
    // '3' should be filtered due to not exist in map
    expect(details.length).toBe(2);
  });

  it('getImageUrlOrBase64ById should return the correct URL or Base64 based on saveMode', () => {
    const localImage = filesSelectors.getImageUrlOrBase64ById('1')(state);
    expect(localImage).toEqual({ id: '1', url: 'base64string1' });

    const serverImage = filesSelectors.getImageUrlOrBase64ById('2')(state);
    expect(serverImage).toEqual({ id: '2', url: 'url2' });

    const nonExistentImage = filesSelectors.getImageUrlOrBase64ById('3')(state);
    expect(nonExistentImage).toBeUndefined();
  });

  it('getImageUrlOrBase64ByList should return the correct list of URLs or Base64 strings', () => {
    const list = ['1', '2', '3'];
    const urlsOrBase64s = filesSelectors.getImageUrlOrBase64ByList(list)(state);
    expect(urlsOrBase64s.length).toBe(2); // '3' 应该被过滤掉，因为它不存在
    expect(urlsOrBase64s[0].url).toBe('base64string1');
    expect(urlsOrBase64s[1].url).toBe('url2');
  });

  it('imageUrlOrBase64List should return a list of image URLs or Base64 strings for all images in inputFilesList', () => {
    const urlsOrBase64s = filesSelectors.imageUrlOrBase64List(state);
    expect(urlsOrBase64s.length).toBe(2); // '3' 是不存在的 ID，所以应该被过滤掉

    expect(urlsOrBase64s).toEqual([
      { id: '1', url: 'base64string1' }, // 本地保存的图像应该使用 base64 URL
      { id: '2', url: 'url2' }, // 服务器保存的图像应该使用普通 URL
    ]);
  });
});
