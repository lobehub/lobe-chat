import { getServerConfig } from '@/config/server';

export const getPreferredRegion = () => {
  try {
    const cfg = getServerConfig();
    if (cfg.OPENAI_FUNCTION_REGIONS.length <= 0) {
      return 'auto';
    }

    return cfg.OPENAI_FUNCTION_REGIONS;
  } catch (error) {
    console.error('get server config failed, error:', error);
    return 'auto';
  }
};
