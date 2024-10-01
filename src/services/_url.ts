// TODO: 未来所有核心路由需要迁移到 trpc，部分不需要迁移的则走 webapi

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
  // chat
  chat: (provider: string) => withBasePath(`/api/chat/${provider}`),
  chatModels: (provider: string) => withBasePath(`/api/chat/models/${provider}`),
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

  // image
  images: '/webapi/api/text-to-image/openai',

  // STT
  stt: '/webapi/stt/openai',

  // TTS
  tts: '/webapi/tts/openai',
  edge: '/webapi/tts/edge',
  microsoft: '/webapi/tts/microsoft',
});
