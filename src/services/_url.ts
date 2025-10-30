/* eslint-disable sort-keys-fix/sort-keys-fix */

export const API_ENDPOINTS = {
  oauth: '/api/auth',

  proxy: '/webapi/proxy',

  // plugins
  gateway: '/webapi/plugin/gateway',

  // trace
  trace: '/webapi/trace',

  // chat
  chat: (provider: string) => `/webapi/chat/${provider}`,

  // models
  models: (provider: string) => `/webapi/models/${provider}`,
  modelPull: (provider: string) => `/webapi/models/${provider}/pull`,

  // image
  images: (provider: string) => `/webapi/text-to-image/${provider}`,

  // STT
  stt: '/webapi/stt/openai',

  // TTS
  tts: '/webapi/tts/openai',
  edge: '/webapi/tts/edge',
  microsoft: '/webapi/tts/microsoft',
};

export const MARKET_OIDC_ENDPOINTS = {
  auth: '/lobehub-oidc/auth',
  token: '/market/oidc/token',
  userinfo: '/market/oidc/userinfo',
  handoff: '/market/oidc/handoff',
  desktopCallback: '/lobehub-oidc/callback/desktop',
};

export const MARKET_ENDPOINTS = {
  base: '/market',
  createAgent: '/market/agent/create',
  getAgentDetail: (identifier: string) => `/market/agent/${encodeURIComponent(identifier)}`,
  createAgentVersion: '/market/agent/versions/create',
};
