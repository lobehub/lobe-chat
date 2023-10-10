import { consola } from 'consola';
import { colors } from 'consola/utils';
import { unset } from 'lodash';
import { existsSync } from 'node:fs';

import {
  entryLocaleJsonFilepath,
  i18nConfig,
  localesResourcesFilepath,
  outputLocaleJsonFilepath,
} from './const';
import { diff, readJSON, tagWhite, tagYellow, writeJSON } from './utils';

export const genDiff = () => {
  consola.start(`Diff between Dev/Prod local...`);

  const resources = require(localesResourcesFilepath(i18nConfig.entryLocale));
  const data = Object.entries(resources.default);

  for (const [ns, devJSON] of data) {
    const filepath = entryLocaleJsonFilepath(`${ns}.json`);
    if (!existsSync(filepath)) continue;
    const prodJSON = readJSON(filepath);

    const diffKeys = diff(devJSON, prodJSON);

    if (diffKeys.length === 0) {
      consola.success(tagWhite(ns), colors.gray(filepath));
      continue;
    }

    consola.warn(tagYellow(ns), diffKeys);

    const clearLocals = [];

    for (const locale of [i18nConfig.entryLocale, ...i18nConfig.outputLocales]) {
      const localeFilepath = outputLocaleJsonFilepath(locale, `${ns}.json`);
      if (!existsSync(localeFilepath)) continue;
      const localeJSON = readJSON(localeFilepath);

      for (const key of diffKeys) {
        unset(localeJSON, key);
      }

      writeJSON(localeFilepath, localeJSON);
      clearLocals.push(locale);
    }
    consola.info('clear', clearLocals);
    consola.success(tagWhite(ns), colors.gray(filepath));
  }
};
