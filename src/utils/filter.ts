import { MetaData } from '@/types/meta';

export const filterWithKeywords = <T extends MetaData>(
  map: Record<string, T>,
  keywords: string,
  extraSearchStr?: (item: T) => string | string[],
) => {
  if (!keywords) return map;

  return Object.fromEntries(
    Object.entries(map).filter(([, item]) => {
      const defaultSearchKey = `${item.title || ''}${item.description || ''}`;
      let extraSearchKey: string = '';
      if (extraSearchStr) {
        const searchStr = extraSearchStr(item);
        if (searchStr instanceof Array) extraSearchKey = searchStr.join('');
        else extraSearchKey = searchStr;
      }

      return `${defaultSearchKey}${extraSearchKey}`.toLowerCase().includes(keywords.toLowerCase());
    }),
  );
};
