import { ModelProvider, ModelRuntime } from '@lobechat/model-runtime';
import { LobeVertexAI } from '@lobechat/model-runtime/vertexai';

import { checkAuth } from '@/app/(backend)/middleware/auth';
import { safeParseJSON } from '@/utils/safeParseJSON';

import { POST as UniverseRoute } from '../[provider]/route';

export const maxDuration = 300;
// due to the Chinese region does not support accessing Google
// we need to use proxy to access it
// refs: https://github.com/google/generative-ai-js/issues/29#issuecomment-1866246513
// if (process.env.HTTP_PROXY_URL) {
//   const { setGlobalDispatcher, ProxyAgent } = require('undici');
//
//   setGlobalDispatcher(new ProxyAgent({ uri: process.env.HTTP_PROXY_URL }));
// }

export const POST: any = checkAuth(async (req: Request, { jwtPayload }) =>
  UniverseRoute(req, {
    createRuntime: () => {
      const googleAuthStr = jwtPayload.apiKey ?? process.env.VERTEXAI_CREDENTIALS ?? undefined;

      const credentials = safeParseJSON(googleAuthStr);
      const googleAuthOptions = credentials ? { credentials } : undefined;

      const instance = LobeVertexAI.initFromVertexAI({
        googleAuthOptions,
        location: process.env.VERTEXAI_LOCATION,
        project: !!credentials?.project_id ? credentials?.project_id : process.env.VERTEXAI_PROJECT,
      });

      return new ModelRuntime(instance);
    },
    params: Promise.resolve({ provider: ModelProvider.VertexAI }),
  }),
);
