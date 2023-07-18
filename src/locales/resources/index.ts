import en_US from './en_US';
import zh_CN from './zh_CN';

const resources = {
  'en-US': en_US,
  'zh-CN': zh_CN,
} as const;
export default resources;
export const defaultResources = zh_CN;
export type Resources = typeof resources;
export type DefaultResources = typeof defaultResources;
export type Namespaces = keyof DefaultResources;
export type Locales = keyof Resources;
