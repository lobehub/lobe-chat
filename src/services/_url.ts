// TODO: 未来路由需要迁移到 trpc or /webapi

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
  proxy: '/api/proxy',
  oauth: '/api/auth',

  // agent markets
  assistantStore: '/api/assistant/store',
  assistant: (identifier: string) => withBasePath(`/api/assistant/${identifier}`),

  // plugins
  gateway: '/api/plugin/gateway',
  pluginStore: '/api/plugin/store',

  // chat
  chat: (provider: string) => withBasePath(`/api/chat/${provider}`),
  chatModels: (provider: string) => withBasePath(`/api/chat/models/${provider}`),

  // trace
  trace: '/api/trace',

  // image
  images: '/api/text-to-image/openai',

  // STT
  stt: '/webapi/stt/openai',

  // TTS
  tts: '/webapi/tts/openai',
  edge: '/webapi/tts/edge',
  microsoft: '/webapi/tts/microsoft',
});
