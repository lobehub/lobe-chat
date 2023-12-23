import { URLS } from '@/services/_url';
import { GlobalServerConfig } from '@/types/settings';

const VERSION_URL = 'https://registry.npmmirror.com/@lobehub/chat';

class GlobalService {
  /**
   * get latest version from npm
   */
  getLatestVersion = async (): Promise<string> => {
    const res = await fetch(VERSION_URL);
    const data = await res.json();

    return data['dist-tags']?.latest;
  };

  getGlobalConfig = async (): Promise<GlobalServerConfig> => {
    const res = await fetch(URLS.config);

    return res.json();
  };
}

export const globalService = new GlobalService();
