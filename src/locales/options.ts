
import type { Locales } from '@/types/locale';

type LocaleOptions = {
  label: string;
  value: Locales;
}[];

export const localeOptions: LocaleOptions = [
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: '繁體中文',
    value: 'zh-TW',
  },
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: 'Russian',
    value: 'ru-RU',
  },
] as LocaleOptions;

export const supportLangs: string[] = localeOptions.map((i) => i.value);
