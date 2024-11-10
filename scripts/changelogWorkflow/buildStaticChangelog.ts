import { consola } from 'consola';
import { readJsonSync, writeJSONSync } from 'fs-extra';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { CHANGELOG_DIR, CHANGELOG_FILE } from './const';
import { formatChangelog, mergeAndSortVersions } from './utils';

export const buildStaticChangelog = () => {
  Object.entries(CHANGELOG_FILE).forEach(([version, path]) => {
    const data = readFileSync(path, 'utf8');
    const newFile = formatChangelog(data);

    const filename = resolve(CHANGELOG_DIR, `${version}.json`);
    let mergedFile = newFile;

    if (existsSync(filename)) {
      const oldFile = readJsonSync(filename, 'utf8');
      mergedFile = mergeAndSortVersions(oldFile, newFile);
    }

    writeJSONSync(filename, mergedFile, { spaces: 2 });

    consola.success(`Changelog ${version} has been built successfully!`);
  });
};
