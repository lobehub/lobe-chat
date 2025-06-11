import { consola } from 'consola';
import { colors } from 'consola/utils';
import { diff } from 'just-diff';
import { unset, cloneDeep } from 'lodash-es';

import { entryLocaleJsonFilepath, i18nConfig, outputLocaleJsonFilepath, srcDefaultLocales } from './const';
import { readJSON, tagWhite, writeJSONWithPrettier } from './utils';
import { existsSync, removeSync } from 'fs-extra';

export const genDefaultLocale = () => {
  consola.info(`Default locale is ${i18nConfig.entryLocale}...`);

  const resources = require(srcDefaultLocales);
  const data = Object.entries(resources.default);
  consola.start(`Generate default locale json, found ${data.length} namespaces...`);

  const changes: Record<string, ReturnType<typeof diff>> = {};
  const removeNamespaces: string[] = [];

  for (const [ns, value] of data) {
    const filepath = entryLocaleJsonFilepath(`${ns}.json`);

    if (!existsSync(filepath)) {
      removeNamespaces.push(ns);
    } else {
      const previousProdJSON = readJSON(filepath);
      const diffResult = diff(previousProdJSON, value as any);
      if (diffResult.length) {
        changes[ns] = diffResult;
      }
    }

    writeJSONWithPrettier(filepath, value);
    consola.success(tagWhite(ns), colors.gray(filepath));
  }

  consola.start(`Check other locales for changes...`);
  for (const locale of i18nConfig.outputLocales) {
    for (const ns of removeNamespaces) {
      const localeFilepath = outputLocaleJsonFilepath(locale, `${ns}.json`);
      removeSync(localeFilepath);
    }

    for (const [ns, diffResult] of Object.entries(changes)) {
      const localeFilepath = outputLocaleJsonFilepath(locale, `${ns}.json`);
      if (!existsSync(localeFilepath)) continue;

      const localeJSON = readJSON(localeFilepath);
      const cleanLocaleJSON = cloneDeep(localeJSON);
      for (const item of diffResult) {
        unset(cleanLocaleJSON, item.path as any);
      }

      writeJSONWithPrettier(localeFilepath, cleanLocaleJSON);
      consola.success(tagWhite(ns), colors.gray(localeFilepath));
    }
  }
};
