import { withElectronProtocolIfElectron } from '@/const/protocol';

/* eslint-disable sort-keys-fix/sort-keys-fix */

export const API_ENDPOINTS = {
  oauth: withElectronProtocolIfElectron('/api/auth'),

  proxy: withElectronProtocolIfElectron('/webapi/proxy'),

  // plugins
  gateway: withElectronProtocolIfElectron('/webapi/plugin/gateway'),

  // trace
  trace: withElectronProtocolIfElectron('/webapi/trace'),

  // chat
  chat: (provider: string) => withElectronProtocolIfElectron(`/webapi/chat/${provider}`),

  // models
  models: (provider: string) => withElectronProtocolIfElectron(`/webapi/models/${provider}`),
  modelPull: (provider: string) =>
    withElectronProtocolIfElectron(`/webapi/models/${provider}/pull`),

  // image
  images: (provider: string) => withElectronProtocolIfElectron(`/webapi/text-to-image/${provider}`),

  // STT
  stt: withElectronProtocolIfElectron('/webapi/stt/openai'),

  // TTS
  tts: withElectronProtocolIfElectron('/webapi/tts/openai'),
  edge: withElectronProtocolIfElectron('/webapi/tts/edge'),
  microsoft: withElectronProtocolIfElectron('/webapi/tts/microsoft'),
};

export const MARKET_OIDC_ENDPOINTS = {
  auth: withElectronProtocolIfElectron('/lobehub-oidc/auth'),
  token: withElectronProtocolIfElectron('/market/oidc/token'),
  userinfo: withElectronProtocolIfElectron('/market/oidc/userinfo'),
  handoff: withElectronProtocolIfElectron('/market/oidc/handoff'),
  desktopCallback: withElectronProtocolIfElectron('/lobehub-oidc/callback/desktop'),
};

export const MARKET_ENDPOINTS = {
  base: withElectronProtocolIfElectron('/market'),
  // Agent management
  createAgent: withElectronProtocolIfElectron('/market/agent/create'),
  getAgentDetail: (identifier: string) =>
    withElectronProtocolIfElectron(`/market/agent/${encodeURIComponent(identifier)}`),
  getOwnAgents: withElectronProtocolIfElectron('/market/agent/own'),
  createAgentVersion: withElectronProtocolIfElectron('/market/agent/versions/create'),
  // Agent status management
  publishAgent: (identifier: string) =>
    withElectronProtocolIfElectron(`/market/agent/${encodeURIComponent(identifier)}/publish`),
  unpublishAgent: (identifier: string) =>
    withElectronProtocolIfElectron(`/market/agent/${encodeURIComponent(identifier)}/unpublish`),
  deprecateAgent: (identifier: string) =>
    withElectronProtocolIfElectron(`/market/agent/${encodeURIComponent(identifier)}/deprecate`),
  // User profile
  getUserProfile: (username: string) =>
    withElectronProtocolIfElectron(`/market/user/${encodeURIComponent(username)}`),
  updateUserProfile: withElectronProtocolIfElectron('/market/user/me'),
};
