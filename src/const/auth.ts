export const LOBE_CHAT_AUTH_HEADER = 'X-lobe-chat-auth';

export const JWT_SECRET_KEY = 'LobeHub · LobeChat';
export const NON_HTTP_PREFIX = 'http_nosafe';

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
  useAzure?: boolean;

  awsAccessKeyId?: string;
  awsRegion?: string;
  awsSecretAccessKey?: string;
}
/* eslint-enable */
