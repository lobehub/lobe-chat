export const OPENAI_PROXY_URL = 'X-openai-end-point';
export const OPENAI_API_KEY_HEADER_KEY = 'X-openai-api-key';

export const USE_AZURE_OPENAI = 'X-use-azure-openai';

export const AZURE_OPENAI_API_VERSION = 'X-azure-openai-api-version';

export const LOBE_CHAT_ACCESS_CODE = 'X-lobe-chat-access-code';

export const ZHIPU_API_KEY_HEADER_KEY = 'X-zhipu-api-key';
export const ZHIPU_PROXY_URL_HEADER_KEY = 'X-zhipu-proxy-url';

export const GOOGLE_API_KEY_HEADER_KEY = 'X-google-api-key';

export const getLobeAuthFromRequest = (req: Request) => {
  const apiKey = req.headers.get(OPENAI_API_KEY_HEADER_KEY);
  const endpoint = req.headers.get(OPENAI_PROXY_URL);
  const accessCode = req.headers.get(LOBE_CHAT_ACCESS_CODE);
  const useAzureStr = req.headers.get(USE_AZURE_OPENAI);
  const apiVersion = req.headers.get(AZURE_OPENAI_API_VERSION);
  const zhipuApiKey = req.headers.get(ZHIPU_API_KEY_HEADER_KEY);
  const zhipuProxyUrl = req.headers.get(ZHIPU_PROXY_URL_HEADER_KEY);
  const googleApiKey = req.headers.get(GOOGLE_API_KEY_HEADER_KEY);

  const useAzure = !!useAzureStr;

  return {
    accessCode,
    apiKey,
    apiVersion,
    endpoint,

    googleApiKey,

    useAzure,

    zhipuApiKey,
    zhipuProxyUrl,
  };
};
