'use server';

import { get } from 'lodash-es';
import { cookies } from 'next/headers';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import { NS, normalizeLocale } from '@/locales/resources';

export const translation = async (ns: NS) => {
  const cookieStore = cookies();
  const defaultLang = cookieStore.get(LOBE_LOCALE_COOKIE);
  const lng = defaultLang?.value || DEFAULT_LANG;
  const filepath = join(process.cwd(), `locales/${normalizeLocale(lng)}/${ns}.json`);
  const file = readFileSync(filepath, 'utf8');
  const i18ns = JSON.parse(file);

  return {
    t: (key: string, options: { [key: string]: string } = {}) => {
      let content = get(i18ns, key);
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          content = content.replace(`{{${key}}}`, value);
        });
      }
      return content;
    },
  };
};
