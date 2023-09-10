import { consola } from 'consola';
import { colors } from 'consola/utils';
import fs from 'node:fs';

import i18nConfig from '../.i18nrc.js';
import { localeDirJsonList, localesResourcesFilepath } from './const';
import { genResourcesContent, genToc } from './utils';

const locales = [i18nConfig.entryLocale, ...i18nConfig.outputLocales];

export const genResources = () => {
  consola.start(`Generate locale resources and types, found ${locales.length} locales...`);

  for (const locale of locales) {
    const files = localeDirJsonList(locale);
    const toc = genToc(files, locale);

    const filepath = localesResourcesFilepath(`${locale}.ts`);
    fs.writeFileSync(filepath, toc);
    consola.success(colors.bgBlue(colors.black(` ${locale} `)), colors.gray(filepath));
  }

  const indexFilepath = localesResourcesFilepath(`index.ts`);
  fs.writeFileSync(indexFilepath, genResourcesContent(locales));

  consola.success(colors.bgGreen(colors.black(` INDEX `)), colors.gray(indexFilepath));
};
