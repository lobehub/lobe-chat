import { tocForResources } from 'i18next-resources-for-ts';
import fs from 'node:fs';
import { resolve } from 'node:path';

import i18nConfig from '../.i18nrc.js';

const locales = [i18nConfig.entryLocale, ...i18nConfig.outputLocales];

const RES_OUTPUT = 'src/locales/resources';

let index = '';
let indexObj = '';
locales.forEach((locale) => {
  const files = fs
    .readdirSync(resolve(i18nConfig.output, locale))
    .filter((name) => name.includes('.json'));
  index += `import ${locale} from "./${locale}";\n`;
  indexObj += `   "${locale.replace('_', '-')}": ${locale},\n`;
  const ns = [];
  files.forEach((file) => {
    ns.push({
      name: file.replace('.json', ''),
      path: resolve(i18nConfig.output, locale, file),
    });
  });
  let toc = tocForResources(ns, resolve(RES_OUTPUT)).replaceAll('\\', '/');
  if (locale === i18nConfig.entryLocale) {
    toc = toc.replaceAll('.json', '').replaceAll('../../../locales/zh_CN', '../default');
  }
  fs.writeFileSync(resolve(RES_OUTPUT, `${locale}.ts`), toc);
});

fs.writeFileSync(
  resolve(RES_OUTPUT, `index.ts`),
  `${index}

export default {
${indexObj}};
`,
);
