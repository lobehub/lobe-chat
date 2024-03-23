import { getServerConfig } from '@/config/server';

export const getPreferredRegion = (region: string | string[] = 'auto') => {
  try {
    const cfg = getServerConfig();
    if (cfg.OPENAI_FUNCTION_REGIONS.length <= 0) {
      return region;
    }

    return cfg.OPENAI_FUNCTION_REGIONS;
  } catch (error) {
    console.error('get server config failed, error:', error);
    return region;
  }
};
