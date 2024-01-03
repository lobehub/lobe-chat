import { JAVA_URL } from "@/utils/axios";

export const URLS = {
  config: "/api/config",
  market: "/api/market",
  proxy: "/api/proxy",
};

export const PLUGINS_URLS = {
  gateway: "/api/plugin/gateway",
  store: "/api/plugin/store",
};

export const OPENAI_URLS = {
  // chat: '/api/openai/chat',
  // chat: JAVA_URL + '/api/chat/testSSE2',
  chat: JAVA_URL + "/api/chat",
  images: "/api/openai/images",
  models: "/api/openai/models",
  stt: "/api/openai/stt",
  tts: "/api/openai/tts",
};

export const TTS_URL = {
  edge: "/api/tts/edge-speech",
  microsoft: "/api/tts/microsoft-speech",
};
