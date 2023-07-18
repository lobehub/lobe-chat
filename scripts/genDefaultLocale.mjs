import fs from 'node:fs';
import { resolve } from 'node:path';

import i18nConfig from '../.i18nrc.js';
import resources from '../src/locales/resources/zh_CN.ts';

for (const [ns, value] of Object.entries(resources)) {
  fs.writeFileSync(
    resolve(i18nConfig.output, i18nConfig.entryLocale, `${ns}.json`),
    JSON.stringify(value, null, 2),
  );
}
