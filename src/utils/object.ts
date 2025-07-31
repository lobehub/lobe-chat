import { isNil, omitBy } from 'lodash-es';

/**
 * 清理对象中的空值（undefined、null、空字符串）
 * @param obj 要清理的对象
 * @returns 清理后的对象
 */
export const cleanObject = <T extends Record<string, any>>(obj: T): T => {
  return omitBy(obj, (value) => isNil(value) || value === '') as T;
};
