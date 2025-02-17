import { checkAuth } from '@/app/(backend)/middleware/auth';
import { AgentRuntime, ModelProvider } from '@/libs/agent-runtime';
import { LobeVertexAI } from '@/libs/agent-runtime/vertexai';

import { POST as UniverseRoute } from '../[provider]/route';

// due to the Chinese region does not support accessing Google
// we need to use proxy to access it
// refs: https://github.com/google/generative-ai-js/issues/29#issuecomment-1866246513
// if (process.env.HTTP_PROXY_URL) {
//   const { setGlobalDispatcher, ProxyAgent } = require('undici');
//
//   setGlobalDispatcher(new ProxyAgent({ uri: process.env.HTTP_PROXY_URL }));
// }

export const POST = checkAuth(async (req: Request, { jwtPayload }) =>
  UniverseRoute(req, {
    createRuntime: () => {
      const googleAuthOptions = jwtPayload.apiKey ?? process.env.VERTEXAI_CREDENTIALS ?? undefined;

      const instance = LobeVertexAI.initFromVertexAI({
        googleAuthOptions: googleAuthOptions as any,
        location: process.env.VERTEXAI_LOCATION,
        project: process.env.VERTEXAI_PROJECT,
      });

      return new AgentRuntime(instance);
    },
    params: Promise.resolve({ provider: ModelProvider.VertexAI }),
  }),
);
