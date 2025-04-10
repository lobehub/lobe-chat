/* eslint-disable sort-keys-fix/sort-keys-fix */
import { transform } from 'lodash-es';

import { withBasePath } from '@/utils/basePath';

const mapWithBasePath = <T extends object>(apis: T): T => {
  return transform(apis, (result, value, key) => {
    if (typeof value === 'string') {
      // @ts-ignore
      result[key] = withBasePath(value);
    } else {
      result[key] = value;
    }
  });
};

export const API_ENDPOINTS = mapWithBasePath({
  oauth: '/api/auth',

  proxy: '/webapi/proxy',

  // assistant
  assistantStore: '/webapi/assistant/store',
  assistant: (identifier: string) => withBasePath(`/webapi/assistant/${identifier}`),

  // plugins
  gateway: '/webapi/plugin/gateway',
  pluginStore: '/webapi/plugin/store',

  // trace
  trace: '/webapi/trace',

  // chat
  chat: (provider: string) => withBasePath(`/webapi/chat/${provider}`),

  // models
  models: (provider: string) => withBasePath(`/webapi/models/${provider}`),
  modelPull: (provider: string) => withBasePath(`/webapi/models/${provider}/pull`),

  // image
  images: (provider: string) => `/webapi/text-to-image/${provider}`,

  // STT
  stt: '/webapi/stt/openai',

  // TTS
  tts: '/webapi/tts/openai',
  edge: '/webapi/tts/edge',
  microsoft: '/webapi/tts/microsoft',
});
