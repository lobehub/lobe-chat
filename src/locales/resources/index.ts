import zh_CN from "./zh_CN";
import en_US from "./en_US";
import ru_RU from "./ru_RU";

const resources = {
   "zh-CN": zh_CN,
   "en-US": en_US,
   "ru-RU": ru_RU,
} as const;
export default resources;
export const defaultResources = zh_CN;
export type Resources = typeof resources;
export type DefaultResources = typeof defaultResources;
export type Namespaces = keyof DefaultResources;
export type Locales = keyof Resources;
