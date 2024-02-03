import { getServerConfig } from '@/config/server';
import { JWTPayload } from '@/const/fetch';
import {
  ChatStreamPayload,
  LobeAzureOpenAI,
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

  static async initializeWithUserPayload(provider: string, payload: JWTPayload) {
    let runtimeModel: LobeRuntimeAI;

    switch (provider) {
      default:
      case 'oneapi':
      case ModelProvider.OpenAI: {
        runtimeModel = this.initOpenAI(payload);
        break;
      }

      case ModelProvider.Azure: {
        runtimeModel = this.initAzureOpenAI(payload);
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

  private static initOpenAI(payload: JWTPayload) {
    const { OPENAI_API_KEY, OPENAI_PROXY_URL } = getServerConfig();
    const apiKey = payload?.apiKey || OPENAI_API_KEY;
    const baseURL = payload?.endpoint || OPENAI_PROXY_URL;

    return new LobeOpenAI({ apiKey, baseURL });
  }

  private static initAzureOpenAI(payload: JWTPayload) {
    const { AZURE_API_KEY, AZURE_API_VERSION, AZURE_ENDPOINT } = getServerConfig();
    const apiKey = payload?.apiKey || AZURE_API_KEY;
    const endpoint = payload?.endpoint || AZURE_ENDPOINT;
    const apiVersion = payload?.azureApiVersion || AZURE_API_VERSION;

    return new LobeAzureOpenAI(endpoint, apiKey, apiVersion);
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
    const { AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_REGION } = getServerConfig();

    let accessKeyId: string | undefined = AWS_ACCESS_KEY_ID;
    let accessKeySecret: string | undefined = AWS_SECRET_ACCESS_KEY;
    let region = AWS_REGION;
    // if the payload has the api key, use user
    if (payload.apiKey) {
      accessKeyId = payload?.awsAccessKeyId;
      accessKeySecret = payload?.awsSecretAccessKey;
      region = payload?.awsRegion;
    }

    return new LobeBedrockAI({ accessKeyId, accessKeySecret, region });
  }
}

export default AgentRuntime;
