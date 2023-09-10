import { localeOptions } from '@/locales/options';
import { Locales } from '@/locales/resources';

import pkg from '../../package.json';
import { INBOX_SESSION_ID } from './session';

export const GITHUB = pkg.homepage;
export const CHANGELOG = `${pkg.homepage}/blob/master/CHANGELOG.md`;
export const ABOUT = pkg.homepage;
export const FEEDBACK = pkg.bugs.url;
export const DISCORD = 'https://discord.gg/AYFPHvv2jT';

export const PLUGINS_INDEX_URL =
  process.env.PLUGINS_INDEX_URL ?? 'https://chat-plugins.lobehub.com/index';

export const getPluginIndexJSON = (lang: Locales = 'en-US', baseUrl = PLUGINS_INDEX_URL) => {
  if (lang === 'en-US' || !localeOptions.map((o) => o.value).includes(lang)) return baseUrl;

  return `${baseUrl}.${lang}.json`;
};

export const AGENTS_INDEX_URL =
  process.env.AGENTS_INDEX_URL ?? 'https://chat-agents.lobehub.com/index';

export const getAgentIndexJSON = (lang: Locales = 'en-US', baseUrl = AGENTS_INDEX_URL) => {
  if (lang === 'en-US') return baseUrl;

  return `${baseUrl}.${lang}.json`;
};

export const AGENTS_INDEX_GITHUB = 'https://github.com/lobehub/lobe-chat-agents';

export const SESSION_CHAT_URL = (id: string = INBOX_SESSION_ID, mobile?: boolean) =>
  mobile ? `/chat/mobile#session=${id}` : `/chat#session=${id}`;
