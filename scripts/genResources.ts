import { consola } from 'consola';
import { colors } from 'consola/utils';
import { tocForResources } from 'i18next-resources-for-ts';
import fs from 'node:fs';
import { resolve } from 'node:path';

import i18nConfig from '../.i18nrc.js';

const locales = [i18nConfig.entryLocale, ...i18nConfig.outputLocales];
export const genResources = (output: string) => {
  let index = '';
  let indexObj = '';
  consola.start(`Generate locale resources and types, found ${locales.length} locales...`);
  for (const locale of locales) {
    const files = fs
      .readdirSync(resolve(i18nConfig.output, locale))
      .filter((name) => name.includes('.json'));
    index += `import ${locale} from "./${locale}";\n`;
    indexObj += `   "${locale.replace('_', '-')}": ${locale},\n`;
    const ns = [];
    for (const file of files) {
      ns.push({
        name: file.replace('.json', ''),
        path: resolve(i18nConfig.output, locale, file),
      });
    }
    let toc = tocForResources(ns, resolve(output)).replaceAll('\\', '/');
    if (locale === i18nConfig.entryLocale) {
      toc = toc.replaceAll('.json', '').replaceAll('../../../locales/zh_CN', '../default');
    }
    const filepath = resolve(output, `${locale}.ts`);
    fs.writeFileSync(filepath, toc);
    consola.success(colors.bgBlue(colors.black(` ${locale} `)), colors.gray(filepath));
  }
  const indexFilepath = resolve(output, `index.ts`);
  fs.writeFileSync(
    indexFilepath,
    `${index}
const resources = {
${indexObj}} as const;
export default resources;
export const defaultResources = ${i18nConfig.entryLocale};
export type Resources = typeof resources;
export type DefaultResources = typeof defaultResources;
export type Namespaces = keyof DefaultResources;
export type Locales = keyof Resources;
`,
  );

  consola.success(colors.bgGreen(colors.black(` INDEX `)), colors.gray(indexFilepath));
};
