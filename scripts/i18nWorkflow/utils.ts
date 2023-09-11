import { consola } from 'consola';
import { colors } from 'consola/utils';
import { tocForResources } from 'i18next-resources-for-ts';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import i18nConfig from '../../.i18nrc';
import { srcLocalesResources } from './const';

export const readJSON = (filePath: string) => {
  const data = readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

export const writeJSON = (filePath: string, data: any) => {
  const jsonStr = JSON.stringify(data, null, 2);
  writeFileSync(filePath, jsonStr, 'utf8');
};

export const genResourcesContent = (locales: string[]) => {
  let index = '';
  let indexObj = '';

  for (const locale of locales) {
    index += `import ${locale} from "./${locale}";\n`;
    indexObj += `   "${locale.replace('_', '-')}": ${locale},\n`;
  }

  return `${index}
const resources = {
${indexObj}} as const;
export default resources;
export const defaultResources = ${i18nConfig.entryLocale};
export type Resources = typeof resources;
export type DefaultResources = typeof defaultResources;
export type Namespaces = keyof DefaultResources;
export type Locales = keyof Resources;
`;
};

export const genNamespaceList = (files: string[], locale: string) => {
  return files.map((file) => ({
    name: file.replace('.json', ''),
    path: resolve(i18nConfig.output, locale, file),
  }));
};

export const genToc = (files: string[], locale: string) => {
  const ns = genNamespaceList(files, locale);
  let toc = tocForResources(ns, srcLocalesResources).replaceAll('\\', '/');
  if (locale === i18nConfig.entryLocale) {
    toc = toc.replaceAll('.json', '').replaceAll('../../../locales/zh_CN', '../default');
  }
  return toc;
};

export const diff = (obj1: any, obj2: any, prefix: string = ''): string[] => {
  let result: string[] = [];
  for (const key in obj1) {
    if (!obj2[key]) continue;
    if (typeof obj1[key] === 'object' && obj1[key] !== null && obj2[key]) {
      result = result.concat(diff(obj1[key], obj2[key], `${key}.`));
    } else if (obj1[key] !== obj2[key]) {
      result.push(`${prefix}${key}`);
    }
  }
  return result;
};

export const unset = (obj: any, key: string) => {
  const keys = key.split('.');
  const lastKey = keys.pop();
  const lastObj = keys.reduce((obj, key) => (obj[key] = obj[key] || {}), obj);
  if (lastKey) delete lastObj[lastKey];
};

export const tagBlue = (text: string) => colors.bgBlueBright(colors.black(` ${text} `));
export const tagYellow = (text: string) => colors.bgYellowBright(colors.black(` ${text} `));
export const tagGreen = (text: string) => colors.bgGreenBright(colors.black(` ${text} `));
export const tagWhite = (text: string) => colors.bgWhiteBright(colors.black(` ${text} `));

export const split = (name: string) => {
  consola.log('');
  consola.log(colors.gray(`========================== ${name} ==============================`));
};
