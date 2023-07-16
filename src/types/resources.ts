import common from '@/../public/locales/zh_CN/common.json';
import setting from '@/../public/locales/zh_CN/setting.json';

const resources = {
  common,
  setting,
} as const;

export default resources;

export type NS = keyof typeof resources;
