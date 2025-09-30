import { merge as _merge, isEmpty, mergeWith } from 'lodash-es';

/**
 * 用于合并对象，如果是数组则直接替换
 * @param target
 * @param source
 */
export const merge: typeof _merge = <T = object>(target: T, source: T) =>
  mergeWith({}, target, source, (obj, src) => {
    if (Array.isArray(obj)) return src;
  });

type MergeableItem = {
  [key: string]: any;
  id?: string;
};

/**
 * Merge two arrays based on id, preserving metadata from default items
 * @param defaultItems Items with default configuration and metadata
 * @param userItems User-defined items with higher priority
 */
export const mergeArrayById = <T extends MergeableItem>(defaultItems: T[], userItems: T[]): T[] => {
  const ensuredDefaultItems = defaultItems.filter((item): item is T & Required<Pick<T, 'id'>> =>
    Boolean(item?.id),
  );

  const defaultItemsMap = new Map(ensuredDefaultItems.map((item) => [item.id, item]));
  const defaultIndexMap = new Map(ensuredDefaultItems.map((item, index) => [item.id, index]));

  const invalidUserItems: T[] = [];
  const customUserItems = new Map<string, T>();
  const mergedDefaultItems = defaultItems.map((item) => ({ ...item }) as T);

  userItems.forEach((userItem) => {
    const userId = userItem?.id;

    if (!userId) {
      invalidUserItems.push(userItem);
      return;
    }

    const defaultItem = defaultItemsMap.get(userId);
    if (!defaultItem) {
      customUserItems.set(userId, userItem);
      return;
    }

    const mergedItem = { ...defaultItem } as T;
    Object.entries(userItem).forEach(([key, value]) => {
      if (value !== null && value !== undefined && !(typeof value === 'object' && isEmpty(value))) {
        // @ts-expect-error
        mergedItem[key] = value;
      }

      if (typeof value === 'object' && !isEmpty(value)) {
        // @ts-expect-error
        mergedItem[key] = merge(defaultItem[key], value);
      }
    });

    const index = defaultIndexMap.get(userId);
    if (typeof index === 'number') mergedDefaultItems[index] = mergedItem;
  });

  return [...invalidUserItems, ...customUserItems.values(), ...mergedDefaultItems];
};
