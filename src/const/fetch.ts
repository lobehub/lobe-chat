export const OPENAI_END_POINT = 'X-openai-end-point';
export const OPENAI_API_KEY_HEADER_KEY = 'X-openai-api-key';

export const USE_AZURE_OPENAI = 'X-use-azure-openai';

export const AZURE_OPENAI_API_VERSION = 'X-azure-openai-api-version';

export const LOBE_CHAT_ACCESS_CODE = 'X-lobe-chat-access-code';

export const getOpenAIAuthFromRequest = (req: Request) => {
  const apiKey = req.headers.get(OPENAI_API_KEY_HEADER_KEY);
  const endpoint = req.headers.get(OPENAI_END_POINT);
  const accessCode = req.headers.get(LOBE_CHAT_ACCESS_CODE);
  const useAzureStr = req.headers.get(USE_AZURE_OPENAI);
  const apiVersion = req.headers.get(AZURE_OPENAI_API_VERSION);

  const useAzure = !!useAzureStr;

  return { accessCode, apiKey, apiVersion, endpoint, useAzure };
};
