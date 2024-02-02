export const LOBE_AI_PROVIDER_AUTH = 'X-lobe-ai-provider-auth';

export const JWT_SECRET_KEY = ' LobeHub · LobeChat';

export interface JWTPayload {
  accessCode?: string;
  apiKey?: string;

  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
}

export const OPENAI_PROXY_URL = 'X-openai-end-point';
export const OPENAI_API_KEY_HEADER_KEY = 'X-openai-api-key';

export const USE_AZURE_OPENAI = 'X-use-azure-openai';

export const AZURE_OPENAI_API_VERSION = 'X-azure-openai-api-version';

export const LOBE_CHAT_ACCESS_CODE = 'X-lobe-chat-access-code';

export const getLobeAuthFromRequest = (req: Request) => {
  const apiKey = req.headers.get(OPENAI_API_KEY_HEADER_KEY);
  const endpoint = req.headers.get(OPENAI_PROXY_URL);
  const accessCode = req.headers.get(LOBE_CHAT_ACCESS_CODE);
  const useAzureStr = req.headers.get(USE_AZURE_OPENAI);
  const apiVersion = req.headers.get(AZURE_OPENAI_API_VERSION);

  const useAzure = !!useAzureStr;

  return {
    accessCode,
    apiKey,
    apiVersion,

    endpoint,

    useAzure,
  };
};
