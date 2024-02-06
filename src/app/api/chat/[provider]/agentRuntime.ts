import { getServerConfig } from '@/config/server';
import { JWTPayload } from '@/const/auth';
import {
  ChatStreamPayload,
  LobeAzureOpenAI,
  LobeBedrockAI,
  LobeGoogleAI,
  LobeMoonshotAI,
  LobeOpenAI,
  LobeRuntimeAI,
  LobeZhipuAI,
  ModelProvider,
} from '@/libs/agent-runtime';

interface AzureOpenAIParams {
  apiVersion?: string;
  model: string;
  useAzure?: boolean;
}

class AgentRuntime {
  private _runtime: LobeRuntimeAI;

  constructor(runtime: LobeRuntimeAI) {
    this._runtime = runtime;
  }

  async chat(payload: ChatStreamPayload) {
    return this._runtime.chat(payload);
  }

  static async initializeWithUserPayload(
    provider: string,
    payload: JWTPayload,
    azureOpenAI?: AzureOpenAIParams,
  ) {
    let runtimeModel: LobeRuntimeAI;

    switch (provider) {
      default:
      case 'oneapi':
      case ModelProvider.OpenAI: {
        runtimeModel = this.initOpenAI(payload, azureOpenAI);
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

      case ModelProvider.Moonshot: {
        runtimeModel = this.initMoonshot(payload);
        break;
      }

      case ModelProvider.Bedrock: {
        runtimeModel = this.initBedrock(payload);
      }
    }

    return new AgentRuntime(runtimeModel);
  }

  private static initOpenAI(payload: JWTPayload, azureOpenAI?: AzureOpenAIParams) {
    const { OPENAI_API_KEY, OPENAI_PROXY_URL, AZURE_API_VERSION, AZURE_API_KEY, USE_AZURE_OPENAI } =
      getServerConfig();
    const apiKey = payload?.apiKey || OPENAI_API_KEY;
    const baseURL = payload?.endpoint || OPENAI_PROXY_URL;

    const azureApiKey = payload.apiKey || AZURE_API_KEY;
    const useAzure = azureOpenAI?.useAzure || USE_AZURE_OPENAI;
    const apiVersion = azureOpenAI?.apiVersion || AZURE_API_VERSION;

    return new LobeOpenAI({
      apiKey: azureOpenAI?.useAzure ? azureApiKey : apiKey,
      azureOptions: {
        apiVersion,
        model: azureOpenAI?.model,
      },
      baseURL,
      useAzure,
    });
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

  private static initMoonshot(payload: JWTPayload) {
    const { MOONSHOT_API_KEY, MOONSHOT_PROXY_URL } = getServerConfig();
    const apiKey = payload?.apiKey || MOONSHOT_API_KEY;

    return new LobeMoonshotAI(apiKey, MOONSHOT_PROXY_URL);
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
