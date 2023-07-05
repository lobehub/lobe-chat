import { BaseDataModel } from '@/types/meta';

import { filterWithKeywords } from './filter';

describe('filterWithKeywords', () => {
  const data: Record<string, BaseDataModel> = {
    1: {
      id: '1',
      meta: {
        description: 'test case',
        tag: ['a', 'b'],
        title: 'hello world',
      },
    },
    2: {
      id: '2',
      meta: {
        description: 'hello world',
        tag: ['c', 'd'],
        title: 'goodbye',
      },
    },
  };

  it('should return an empty object if map is empty', () => {
    const result = filterWithKeywords({}, 'hello');
    expect(result).toEqual({});
  });

  it('should return the original map if keywords is empty', () => {
    const result = filterWithKeywords(data, '');
    expect(result).toEqual(data);
  });

  it('should return a filtered map if keywords is not empty', () => {
    const result = filterWithKeywords(data, 'world');
    expect(result).toEqual({
      1: {
        id: '1',
        meta: {
          description: 'test case',
          tag: ['a', 'b'],
          title: 'hello world',
        },
      },
      2: {
        id: '2',
        meta: {
          description: 'hello world',
          tag: ['c', 'd'],
          title: 'goodbye',
        },
      },
    });
  });

  it('should only consider title, description and tag properties if extraSearchStr is not provided', () => {
    const result = filterWithKeywords(data, 'test');
    expect(result).toEqual({
      1: {
        id: '1',
        meta: {
          description: 'test case',
          tag: ['a', 'b'],
          title: 'hello world',
        },
      },
    });
  });

  it('should consider extraSearchStr in addition to title, description and tag properties if provided', () => {
    const extraSearchString = (item: BaseDataModel) => {
      return item.meta.avatar || '';
    };
    const data: Record<string, BaseDataModel> = {
      a: {
        id: 'a',
        meta: {
          avatar: 'xxx',
          description: 'test case',
          tag: ['a', 'b'],
          title: 'hello world',
        },
      },
      b: {
        id: 'b',
        meta: {
          avatar: 'yyy',
          description: 'hello world',
          tag: ['c', 'd'],
          title: 'goodbye',
        },
      },
    };

    const result = filterWithKeywords(data, 'yyy', extraSearchString);
    expect(result).toEqual({
      b: {
        id: 'b',
        meta: {
          avatar: 'yyy',
          description: 'hello world',
          tag: ['c', 'd'],
          title: 'goodbye',
        },
      },
    });
  });

  it('should ensure that each filtered object has at least one property that includes the keyword or extraSearchStr', () => {
    const result = filterWithKeywords(data, 't');
    expect(result).toEqual({
      1: {
        id: '1',
        meta: {
          description: 'test case',
          tag: ['a', 'b'],
          title: 'hello world',
        },
      },
    });
  });
});
