import { getLLMConfig } from '@/config/llm';

export const getPreferredRegion = (region: string | string[] = 'auto') => {
  try {
    if (getLLMConfig().OPENAI_FUNCTION_REGIONS.length <= 0) {
      return region;
    }

    return getLLMConfig().OPENAI_FUNCTION_REGIONS;
  } catch (error) {
    console.error('get server config failed, error:', error);
    return region;
  }
};
