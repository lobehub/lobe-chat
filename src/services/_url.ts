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
  tts: (provider: string) => withElectronProtocolIfElectron(`/webapi/tts/${provider}`),
  edge: withElectronProtocolIfElectron('/webapi/tts/edge'),
  microsoft: withElectronProtocolIfElectron('/webapi/tts/microsoft'),
};

export const MARKET_OIDC_ENDPOINTS = {
  // NOTE: `auth` is used to open a page in the system browser (desktop) / popup (web),
  // so it must always be an HTTP(S) path joined with `NEXT_PUBLIC_MARKET_BASE_URL`.
  // It MUST NOT be wrapped by the Electron backend protocol.
  auth: '/lobehub-oidc/auth',
  token: withElectronProtocolIfElectron('/market/oidc/token'),
  userinfo: withElectronProtocolIfElectron('/market/oidc/userinfo'),
  handoff: withElectronProtocolIfElectron('/market/oidc/handoff'),
  // Same as `auth`: used as `redirect_uri` (must be a real web URL under market base).
  desktopCallback: '/lobehub-oidc/callback/desktop',
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
