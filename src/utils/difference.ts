import { isEqual, isObject, transform } from 'lodash-es';

export const difference = <T extends object>(object: T, base: T) => {
  const changes = (object: any, base: any) =>
    transform(object, (result: any, value, key) => {
      if (!isEqual(value, base[key])) {
        result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
      }
    });

  return changes(object, base);
};
