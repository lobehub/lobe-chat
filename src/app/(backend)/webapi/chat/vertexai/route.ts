import { AgentRuntime, ModelProvider } from '@/libs/agent-runtime';
import { LobeVertexAI } from '@/libs/agent-runtime/vertexai';
import { safeParseJSON } from '@/utils/safeParseJSON';

import { POST as UniverseRoute } from '../[provider]/route';

export const POST = async (req: Request) =>
  UniverseRoute(req, {
    createRuntime: () => {
      const credentialsContent = process.env.VERTEXAI_CREDENTIALS ?? undefined;

      const googleAuthOptions = credentialsContent ? safeParseJSON(credentialsContent) : {};

      const instance = LobeVertexAI.initFromVertexAI({
        googleAuthOptions: googleAuthOptions,
        location: process.env.VERTEXAI_LOCATION,
        project: process.env.VERTEXAI_PROJECT,
      });

      return new AgentRuntime(instance);
    },
    params: Promise.resolve({ provider: ModelProvider.VertexAI }),
  });
