'use server';

import { get } from 'lodash-es';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { DEFAULT_LANG } from '@/const/locale';
import { Locales, NS, normalizeLocale } from '@/locales/resources';
import { isDev } from '@/utils/env';

export const getLocale = async (hl?: string): Promise<Locales> => {
  if (hl) return normalizeLocale(hl) as Locales;
  return DEFAULT_LANG as Locales;
};

export const translation = async (ns: NS = 'common', hl: string) => {
  let i18ns = {};
  const lng = await getLocale(hl);
  try {
    let filepath = join(process.cwd(), `locales/${normalizeLocale(lng)}/${ns}.json`);
    const isExist = existsSync(filepath);
    if (!isExist)
      filepath = join(
        process.cwd(),
        `locales/${normalizeLocale(isDev ? 'zh-CN' : DEFAULT_LANG)}/${ns}.json`,
      );
    const file = readFileSync(filepath, 'utf8');
    i18ns = JSON.parse(file);
  } catch (e) {
    console.error('Error while reading translation file', e);
  }

  return {
    locale: lng,
    t: (key: string, options: { [key: string]: string } = {}) => {
      if (!i18ns) return key;
      let content = get(i18ns, key);
      if (!content) return key;
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          content = content.replace(`{{${key}}}`, value);
        });
      }
      return content;
    },
  };
};
