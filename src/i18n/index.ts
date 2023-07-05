import { type SelectProps } from 'antd';

export type I18n = 'en_US' | 'zh-CN' | 'zh_HK' | 'ja_JP' | 'ko_KR';

export const I18nOptions: SelectProps['options'] = [
  {
    label: 'English',
    value: 'en_US',
  },
  {
    label: '简体中文',
    value: 'zh_CN',
  },
  {
    label: '繁體中文',
    value: 'zh_HK',
  },
  {
    label: '日本語',
    value: 'ja_JP',
  },
  {
    label: '한국어',
    value: 'ko_KR',
  },
];
