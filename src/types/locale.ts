import resources from '@/locales/resources';
import defaultResources from '@/locales/resources/zh_CN';

export type Resources = typeof resources;
export type DefaultResources = typeof defaultResources;
export type Namespaces = keyof DefaultResources;
export type Locales = keyof Resources;
