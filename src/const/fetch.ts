export const OPENAI_END_POINT = 'X-OPENAI-END_POINT';
export const OPENAI_API_KEY_HEADER_KEY = 'X-OPENAI-API-KEY';

export const USE_AZURE_OPENAI = 'X-USE_AZURE_OPENAI';

export const AZURE_OPENAI_API_VERSION = 'X-AZURE_OPENAI_API_VERSION';

export const LOBE_CHAT_ACCESS_CODE = 'X-LOBE_CHAT_ACCESS_CODE';

export const getOpenAIAuthFromRequest = (req: Request) => {
  const apiKey = req.headers.get(OPENAI_API_KEY_HEADER_KEY);
  const endpoint = req.headers.get(OPENAI_END_POINT);
  const accessCode = req.headers.get(LOBE_CHAT_ACCESS_CODE);
  const useAzureStr = req.headers.get(USE_AZURE_OPENAI);
  const apiVersion = req.headers.get(AZURE_OPENAI_API_VERSION);

  const useAzure = !!useAzureStr;

  return { accessCode, apiKey, apiVersion, endpoint, useAzure };
};
