import { consola } from 'consola';
import { colors } from 'consola/utils';
import { writeFileSync } from 'node:fs';

import { i18nConfig, localeDirJsonList, localesResourcesFilepath } from './const';
import { genResourcesContent, genToc, tagBlue, tagGreen } from './utils';

const locales = [i18nConfig.entryLocale, ...i18nConfig.outputLocales];

export const genResources = () => {
  consola.start(`Generate locale resources and types, found ${locales.length} locales...`);

  for (const locale of locales) {
    const files = localeDirJsonList(locale);
    const toc = genToc(files, locale);

    const filepath = localesResourcesFilepath(`${locale}.ts`);
    writeFileSync(filepath, toc);
    consola.success(tagBlue(locale), colors.gray(filepath));
  }

  const indexFilepath = localesResourcesFilepath(`index.ts`);
  writeFileSync(indexFilepath, genResourcesContent(locales));

  consola.success(tagGreen('INDEX'), colors.gray(indexFilepath));
};
