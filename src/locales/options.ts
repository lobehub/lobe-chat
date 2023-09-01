import type { SelectProps } from 'antd';

import type { Locales } from '@/types/locale';

type LocaleOptions = SelectProps['options'] &
  {
    value: Locales;
  }[];

export const options: LocaleOptions = [
  {
    label: '简体中文',
    value: 'zh-CN',
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
