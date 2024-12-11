import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getLLMConfig } from '@/config/llm';
import { AgentRuntime, ModelProvider } from '@/libs/agent-runtime';
import { LobeVertexAI } from '@/libs/agent-runtime/vertexai';
import { safeParseJSON } from '@/utils/safeParseJSON';

import { POST as UniverseRoute } from '../[provider]/route';

export const POST = async (req: Request) =>
  UniverseRoute(req, {
    createRuntime: () => {
      const {
        VERTEXAI_PROJECT,
        VERTEXAI_LOCATION,
        VERTEXAI_CREDENTIALS,
        VERTEXAI_CREDENTIALS_PATH,
      } = getLLMConfig();

      const credentialsContent =
        VERTEXAI_CREDENTIALS ??
        (VERTEXAI_CREDENTIALS_PATH
          ? readFileSync(resolve(process.cwd(), VERTEXAI_CREDENTIALS_PATH), 'utf8')
          : undefined);

      const googleAuthOptions = credentialsContent ? safeParseJSON(credentialsContent) : undefined;

      const instance = LobeVertexAI.initFromVertexAI({
        googleAuthOptions: googleAuthOptions,
        location: VERTEXAI_LOCATION,
        project: VERTEXAI_PROJECT,
      });

      return new AgentRuntime(instance);
    },
    params: { provider: ModelProvider.VertexAI },
  });
