import en_US from './en_US';
import ru_RU from './ru_RU';
import zh_CN from './zh_CN';
import zh_TW from './zh_TW';

const resources = {
  'en-US': en_US,
  'ru-RU': ru_RU,
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
} as const;
export default resources;
export const defaultResources = zh_CN;
export type Resources = typeof resources;
export type DefaultResources = typeof defaultResources;
export type Namespaces = keyof DefaultResources;
export type Locales = keyof Resources;
