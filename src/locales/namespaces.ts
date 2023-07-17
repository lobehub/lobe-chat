import enCommon from './en_US/common';
import settingEN from './en_US/setting';
import zhCommon from './zh_CN/common';
import settingZH from './zh_CN/setting';

export const commonLocaleSet = {
  'en-US': enCommon,
  'zh-CN': zhCommon,
};

export const settingsLocaleSet = {
  'en-US': settingEN,
  'zh-CN': settingZH,
};

export type Language = 'zh-CN' | 'en-US';
