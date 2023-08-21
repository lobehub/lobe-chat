import pkg from '../../package.json';

export const GITHUB = pkg.homepage;
export const CHANGELOG = `${pkg.homepage}/blob/master/CHANGELOG.md`;
export const ABOUT = pkg.homepage;
export const FEEDBACK = pkg.bugs.url;
export const DISCORD = 'https://discord.gg/AYFPHvv2jT';

export const PLUGINS_INDEX_URL =
  process.env.PLUGINS_INDEX_URL ??
  'https://registry.npmmirror.com/@lobehub/lobe-chat-plugins/latest/files';
