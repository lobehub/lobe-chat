import { llmEnv } from '@/config/llm';

export const getPreferredRegion = (region: string | string[] = 'auto') => {
  try {
    if (llmEnv.OPENAI_FUNCTION_REGIONS.length <= 0) {
      return region;
    }

    return llmEnv.OPENAI_FUNCTION_REGIONS;
  } catch (error) {
    console.error('get server config failed, error:', error);
    return region;
  }
};
