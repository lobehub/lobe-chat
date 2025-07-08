import { Locales } from '@/locales/resources';
import { PageProps } from '@/types/next';

export * from './assistants';
export * from './mcp';
export * from './models';
export * from './plugins';
export * from './providers';

export enum DiscoverTab {
  Assistants = 'assistant',
  Home = 'home',
  Mcp = 'mcp',
  Models = 'model',
  Plugins = 'plugin',
  Providers = 'provider',
}

export type DiscoverPageProps<T = string> = PageProps<
  { slug: T; variants: string },
  { hl?: Locales }
>;

export type IdentifiersResponse = {
  identifier: string;
  lastModified: string;
}[];

export enum CacheTag {
  Assistants = 'assistants',
  Discover = 'discover',
  MCP = 'mcp',
  Models = 'models',
  Plugins = 'plugins',
  Providers = 'providers',
}

export enum CacheRevalidate {
  List = 3600,
  Details = 43_200,
}
