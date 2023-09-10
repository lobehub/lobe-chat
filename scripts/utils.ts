import { tocForResources } from 'i18next-resources-for-ts';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import i18nConfig from '../.i18nrc';
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
