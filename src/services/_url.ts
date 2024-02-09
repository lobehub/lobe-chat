/* eslint-disable sort-keys-fix/sort-keys-fix */
export const API_ENDPOINTS = {
  config: 'api/config',
  proxy: 'api/proxy',

  // agent markets
  market: 'api/market',

  // plugins
  gateway: 'api/plugin/gateway',
  pluginStore: 'api/plugin/store',

  // chat
  chat: (provider: string) => `api/chat/${provider}`,

  // image
  images: 'api/openai/images',

  // TTS & STT
  stt: 'api/openai/stt',
  tts: 'api/openai/tts',
  edge: 'api/tts/edge-speech',
  microsoft: 'api/tts/microsoft-speech',
};
