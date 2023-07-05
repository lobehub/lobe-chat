import { BaseDataModel } from '@/types/meta';

export const filterWithKeywords = <T extends BaseDataModel>(
  map: Record<string, T>,
  keywords: string,
  extraSearchString?: (item: T) => string | string[],
) => {
  if (!keywords) return map;

  return Object.fromEntries(
    Object.entries(map).filter(([, item]) => {
      const meta = item.meta;

      const keyList = [meta.title, meta.description, meta.tag?.join('')].filter(
        Boolean,
      ) as string[];

      const defaultSearchKey = keyList.join('');

      let extraSearchKey: string = '';
      if (extraSearchString) {
        const searchString = extraSearchString(item);
        extraSearchKey = Array.isArray(searchString) ? searchString.join('') : searchString;
      }

      return `${defaultSearchKey}${extraSearchKey}`.toLowerCase().includes(keywords.toLowerCase());
    }),
  );
};
