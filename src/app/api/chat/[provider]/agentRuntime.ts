import { checkAuthWithProvider } from '@/app/api/chat/[provider]/checkAuthWithProvider';
import { getServerConfig } from '@/config/server';
import { getLobeAuthFromRequest } from '@/const/fetch';
import {
  AgentRuntimeErrorType,
  LobeBedrockAI,
  LobeGoogleAI,
  LobeOpenAI,
  LobeRuntimeAI,
  LobeZhipuAI,
  ModelProvider,
  createLobeRuntimeError,
} from '@/libs/agent-runtime';
import { ChatStreamPayload } from '@/types/openai/chat';

class AgentRuntime {
  private _runtime: LobeRuntimeAI;
  constructor(runtime: LobeRuntimeAI) {
    this._runtime = runtime;
  }
  async chat(payload: ChatStreamPayload) {
    return this._runtime.chat(payload);
  }

  static async initFromRequest(provider: string, req: Request) {
    let runtimeModel: LobeRuntimeAI;

    switch (provider) {
      default:
      case 'oneapi':
      case ModelProvider.OpenAI: {
        runtimeModel = await this.initOpenAI(req);
        break;
      }

      case ModelProvider.ZhiPu: {
        runtimeModel = await this.initZhipu(req);
        break;
      }

      case ModelProvider.Google: {
        runtimeModel = await this.initGoogle(req);
        break;
      }

      case ModelProvider.Bedrock: {
        runtimeModel = await this.initBedrock(req);
      }
    }

    return new AgentRuntime(runtimeModel);
  }

  private static async initOpenAI(req: Request) {
    const payload = (await req.json()) as ChatStreamPayload;

    return new LobeOpenAI(req, payload.model);
  }

  private static async initZhipu(req: Request) {
    const { accessCode, zhipuApiKey } = getLobeAuthFromRequest(req);

    checkAuthWithProvider(
      { accessCode, apiKey: zhipuApiKey },
      AgentRuntimeErrorType.InvalidAccessCode,
    );

    const { ZHIPU_API_KEY } = getServerConfig();
    const apikey = zhipuApiKey || ZHIPU_API_KEY;

    return LobeZhipuAI.fromAPIKey(apikey);
  }

  private static async initGoogle(req: Request) {
    console.log(req.url);
    return new LobeGoogleAI(process.env.GOOGLE_API_KEY || '');
  }

  private static async initBedrock(req: Request) {
    console.log(req.url);
    const { AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID } = getServerConfig();
    if (!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY))
      throw createLobeRuntimeError(AgentRuntimeErrorType.InvalidZhipuAPIKey);

    return new LobeBedrockAI({
      accessKeyId: AWS_ACCESS_KEY_ID,
      accessKeySecret: AWS_SECRET_ACCESS_KEY,
    });
  }
}

export default AgentRuntime;
