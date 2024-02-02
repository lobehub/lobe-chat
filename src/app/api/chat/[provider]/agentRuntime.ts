import { getServerConfig } from '@/config/server';
import { JWTPayload } from '@/const/fetch';
import {
  ChatStreamPayload,
  LobeBedrockAI,
  LobeGoogleAI,
  LobeOpenAI,
  LobeRuntimeAI,
  LobeZhipuAI,
  ModelProvider,
} from '@/libs/agent-runtime';

class AgentRuntime {
  private _runtime: LobeRuntimeAI;

  constructor(runtime: LobeRuntimeAI) {
    this._runtime = runtime;
  }

  async chat(payload: ChatStreamPayload) {
    return this._runtime.chat(payload);
  }

  static async initFromRequest(provider: string, payload: JWTPayload, req: Request) {
    let runtimeModel: LobeRuntimeAI;

    switch (provider) {
      default:
      case 'oneapi':
      case ModelProvider.OpenAI: {
        runtimeModel = await this.initOpenAI(req);
        break;
      }

      case ModelProvider.ZhiPu: {
        runtimeModel = await this.initZhipu(payload);
        break;
      }

      case ModelProvider.Google: {
        runtimeModel = this.initGoogle(payload);
        break;
      }

      case ModelProvider.Bedrock: {
        runtimeModel = this.initBedrock(payload);
      }
    }

    return new AgentRuntime(runtimeModel);
  }

  private static async initOpenAI(req: Request) {
    const payload = (await req.json()) as ChatStreamPayload;

    return new LobeOpenAI(req, payload.model);
  }

  private static async initZhipu(payload: JWTPayload) {
    const { ZHIPU_API_KEY } = getServerConfig();
    const apiKey = payload?.apiKey || ZHIPU_API_KEY;

    return LobeZhipuAI.fromAPIKey(apiKey);
  }

  private static initGoogle(payload: JWTPayload) {
    const { GOOGLE_API_KEY } = getServerConfig();
    const apiKey = payload?.apiKey || GOOGLE_API_KEY;

    return new LobeGoogleAI(apiKey);
  }

  private static initBedrock(payload: JWTPayload) {
    const { AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID } = getServerConfig();

    const accessKeyId = payload?.awsAccessKeyId || AWS_ACCESS_KEY_ID;
    const accessKeySecret = payload?.awsSecretAccessKey || AWS_SECRET_ACCESS_KEY;

    return new LobeBedrockAI({ accessKeyId, accessKeySecret });
  }
}

export default AgentRuntime;
