export interface DataItem {
  author: string;
  createAt: string;
  homepage: string;
  identifier: string;
  meta: { avatar: string; description: string; tags: string[]; title: string };
}

export const MARKET_URL = 'https://chat-preview.lobehub.com/market';
export const PLGUIN_URL = 'https://chat-preview.lobehub.com/settings/agent';
export const AGENT_EN_URL = 'https://chat-agents.lobehub.com/index.json';
export const AGENT_CN_URL = 'https://chat-agents.lobehub.com/index.zh-CN.json';
export const AGENT_REPO = 'https://github.com/lobehub/lobe-chat-agents';
export const PLUGIN_EN_URL = 'https://chat-plugins.lobehub.com/index.json';
export const PLUGIN_CN_URL = 'https://chat-plugins.lobehub.com/index.zh-CN.json';
export const PLUGIN_REPO = 'https://github.com/lobehub/lobe-chat-plugins';

export const AGENT_SPLIT = '<!-- AGENT LIST -->';
export const PLUGIN_SPLIT = '<!-- PLUGIN LIST -->';
