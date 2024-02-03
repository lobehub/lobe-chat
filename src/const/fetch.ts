export const LOBE_CHAT_AUTH_HEADER = 'X-lobe-chat-auth';

export const JWT_SECRET_KEY = 'LobeHub · LobeChat';

/* eslint-disable typescript-sort-keys/interface */
export interface JWTPayload {
  /**
   * password
   */
  accessCode?: string;
  /**
   * Represents the user's API key
   *
   * If provider need multi keys like bedrock,
   * this will be used as the checker whether to use frontend key
   */
  apiKey?: string;
  /**
   * Represents the endpoint of provider
   */
  endpoint?: string;

  azureApiVersion?: string;

  awsAccessKeyId?: string;
  awsRegion?: string;
  awsSecretAccessKey?: string;
}
/* eslint-enable */

/**
 * @deprecated
 */
export const OPENAI_PROXY_URL = 'X-openai-end-point';

/**
 * @deprecated
 */
export const OPENAI_API_KEY_HEADER_KEY = 'X-openai-api-key';

/**
 * @deprecated
 */
export const USE_AZURE_OPENAI = 'X-use-azure-openai';

/**
 * @deprecated
 */
export const AZURE_OPENAI_API_VERSION = 'X-azure-openai-api-version';

/**
 * @deprecated
 */
export const LOBE_CHAT_ACCESS_CODE = 'X-lobe-chat-access-code';

/**
 * @deprecated
 */
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
