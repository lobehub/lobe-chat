import { getLLMConfig } from '@/config/llm';
import { AgentRuntime, ModelProvider } from '@/libs/agent-runtime';
import LobeWenxinAI from '@/libs/agent-runtime/wenxin';

import { POST as UniverseRoute } from '../[provider]/route';

export const runtime = 'nodejs';

export const maxDuration = 30;

export const POST = async (req: Request) =>
  UniverseRoute(req, {
    createRuntime: (payload) => {
      const { WENXIN_ACCESS_KEY, WENXIN_SECRET_KEY } = getLLMConfig();
      let accessKey: string | undefined = WENXIN_ACCESS_KEY;
      let secretKey: string | undefined = WENXIN_SECRET_KEY;

      // if the payload has the api key, use user
      if (payload.apiKey) {
        accessKey = payload?.wenxinAccessKey;
        secretKey = payload?.wenxinSecretKey;
      }

      const params = { accessKey, secretKey };
      const instance = new LobeWenxinAI(params);

      return new AgentRuntime(instance);
    },
    params: Promise.resolve({ provider: ModelProvider.Wenxin }),
  });
