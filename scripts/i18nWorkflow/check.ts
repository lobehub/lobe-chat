import { consola } from 'consola';
import { colors } from 'consola/utils';
import { diff } from 'just-diff';
import { existsSync } from 'node:fs';
import { forOwn, isPlainObject } from 'lodash-es';
import { split, readJSON, tagWhite } from './utils';

import { entryLocaleJsonFilepath, i18nConfig, outputLocaleJsonFilepath, srcDefaultLocales } from './const';

const toArr = <T>(any: T | T[]): T[] => {
  if (Array.isArray(any)) return any;
  // eslint-disable-next-line eqeqeq
  return any != null ? [any] : [];
};

function getAllPaths(obj: Record<string, any>) {
  if (!isPlainObject(obj)) {
    throw new Error('Input must be a plain object');
  }

  const paths = new Set<string>();
  const visited = new WeakSet();

  function traverse(current: Record<string, any>, pathParts: string[]) {
    if (!isPlainObject(current) || current === null) return;

    if (visited.has(current)) return;
    visited.add(current);

    forOwn(current, (value, key) => {
      const currentPathParts = [...pathParts, key];

      if (isPlainObject(value) && value !== null) {
        traverse(value, currentPathParts);
      } else {
        paths.add(currentPathParts.join('-->'));
      }
    });
  }

  traverse(obj, []);

  return paths;
}


const checker = () => {
  const resources = require(srcDefaultLocales);

  const data: [string, object][] = Object.entries(resources.default);

  const missNamespaces: string[] = [];
  const differenceMap: Record<string, ReturnType<typeof diff>> = {};
  const missKeys: Record<string, Record<string, Set<string>>> = {};
  const allEntries = new Map<string, Set<string>>();

  for (const [ns, devJSON] of data) {
    allEntries.set(ns, getAllPaths(devJSON));

    const filepath = entryLocaleJsonFilepath(`${ns}.json`);
    if (!existsSync(filepath)) {
      missNamespaces.push(`${ns}.json`);
      continue;
    }

    const prodJSON = readJSON(filepath);

    const diffResult = diff(prodJSON, devJSON);

    if (diffResult.length > 0) {
      differenceMap[ns] = diffResult;
    }

    for (const locale of i18nConfig.outputLocales) {
      missKeys[locale] ??= {};
      missKeys[locale][ns] ??= new Set<string>();

      const localeFilepath = outputLocaleJsonFilepath(locale, `${ns}.json`);

      if (!existsSync(localeFilepath)) {
        const keys = allEntries.get(ns);
        missKeys[locale][ns] = keys || new Set();
        continue;
      }

      const localeJSON = readJSON(localeFilepath);
      const localeKeys = getAllPaths(localeJSON);
      missKeys[locale][ns] = allEntries.get(ns)!.difference(localeKeys) || new Set();
    }
  }

  if (Object.keys(differenceMap).length > 0) {
    consola.warn(
      colors.yellowBright(`⚠️ Differences found between development and production locales:`),
    );
    for (const [ns, diffs] of Object.entries(differenceMap)) {
      consola.warn(colors.yellowBright(`⚠️ Namespace: ${ns}`));
      for (const diff of diffs) {
        console.log(`\t- ${diff.op} at \`${toArr(diff.path).join(' --> ')}\``);
      }
    }
  }

  if (missNamespaces.length > 0) {
    consola.fail(tagWhite(i18nConfig.entryLocale), colors.red(`❌ Missing namespaces in production: ${missNamespaces.join(', ')}`));
  }

  // br
  console.log();
  console.log();

  const hasMissKeys = Object.values(missKeys).some(localeKeys =>
    Object.values(localeKeys).some(nsKeys => nsKeys.size > 0)
  );

  if ([
    Object.keys(differenceMap).length,
    missNamespaces.length,
    hasMissKeys
  ].some(Boolean)) {
    split('DIFF ANALYSIS');
    throw new Error(
      colors.redBright(`❌ i18n workflow check failed. Please fix the issues above.`),
    );
  }
};

checker();
