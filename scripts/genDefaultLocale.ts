import { consola } from 'consola';
import { colors } from 'consola/utils';
import fs from 'node:fs';
import { resolve } from 'node:path';

import i18nConfig from '../.i18nrc';

export const genDefaultLocale = (input: string) => {
  consola.info(`Default locale is ${i18nConfig.entryLocale}...`);
  const resources = require(`../${input}/${i18nConfig.entryLocale}`);
  const data = Object.entries(resources.default);
  consola.start(`Generate default locale json, found ${data.length} namespaces...`);
  for (const [ns, value] of data) {
    const filepath = resolve(i18nConfig.output, i18nConfig.entryLocale, `${ns}.json`);
    fs.writeFileSync(filepath, JSON.stringify(value, null, 2));
    consola.success(colors.bgWhiteBright(colors.black(` ${ns} `)), colors.gray(filepath));
  }
};
